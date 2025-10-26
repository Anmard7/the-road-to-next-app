import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/aws';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { deleteS3ObjectsByKeys } from '../utils/delete-s3-objects';
import { generateS3Key } from '../utils/generate-s3-key';
import { parseS3Key } from '../utils/parse-s3-key';

// Cleanup expired pending attachments (older than 1 hour)
const cleanupExpiredPendingAttachments = async () => {
  console.log('🕐 Cleaning up expired pending attachments...');

  let totalPendingCleaned = 0;
  let totalS3Deleted = 0;
  const errors: string[] = [];

  try {
    // Find pending attachments older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const expiredPending = await prisma.attachment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo,
        },
      },
      include: {
        ticket: {
          select: {
            organisationId: true,
            id: true,
          },
        },
      },
    });

    if (expiredPending.length === 0) {
      console.log('   - No expired pending attachments found');
      return { totalPendingCleaned: 0, totalS3Deleted: 0, errors };
    }

    console.log(
      `📋 Found ${expiredPending.length} expired pending attachments`,
    );

    // Build S3 keys and delete objects
    const s3KeysToDelete: string[] = [];
    const attachmentIdsToDelete: string[] = [];

    for (const attachment of expiredPending) {
      const key = generateS3Key({
        organisationId: attachment.ticket.organisationId,
        ticketId: attachment.ticket.id,
        fileName: attachment.name,
        attachmentId: attachment.id,
      });
      s3KeysToDelete.push(key);
      attachmentIdsToDelete.push(attachment.id);
    }

    // Delete from S3 (ignore errors if objects don't exist)
    if (s3KeysToDelete.length > 0) {
      try {
        const deleteResult = await deleteS3ObjectsByKeys(s3KeysToDelete);
        totalS3Deleted = deleteResult.successful;
        console.log(`   - Deleted ${totalS3Deleted} files from S3`);

        if (deleteResult.errors.length > 0) {
          console.warn(
            `   - S3 deletion warnings: ${deleteResult.errors.length}`,
          );
          errors.push(...deleteResult.errors.map((e) => `S3 delete: ${e}`));
        }
      } catch (error) {
        const errorMessage = `Failed to delete S3 objects: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`   - ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    // Delete from database
    try {
      const deleteResult = await prisma.attachment.deleteMany({
        where: {
          id: {
            in: attachmentIdsToDelete,
          },
        },
      });
      totalPendingCleaned = deleteResult.count;
      console.log(
        `   - Deleted ${totalPendingCleaned} pending attachments from database`,
      );
    } catch (error) {
      const errorMessage = `Failed to delete pending attachments: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`   - ${errorMessage}`);
      errors.push(errorMessage);
    }
  } catch (error) {
    const errorMessage = `Pending attachment cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`   - ${errorMessage}`);
    errors.push(errorMessage);
  }

  return { totalPendingCleaned, totalS3Deleted, errors };
};

// Event handler for manual or scheduled orphaned files cleanup
// To run as a cron job, you can trigger this via: inngest.send({ name: 'app/cleanup.orphaned-files', data: {} })
const runOrphanCleanup = async () => {
  console.log('🧹 Starting orphaned files cleanup job');

  let totalObjectsChecked = 0;
  let totalOrphanedFiles = 0;
  let totalDeletedFiles = 0;
  const errors: string[] = [];

  try {
    // First pass: cleanup expired pending attachments
    console.log('--- Pass 1: Cleanup expired pending attachments ---');
    const pendingCleanup = await cleanupExpiredPendingAttachments();
    errors.push(...pendingCleanup.errors);

    // Second pass: cleanup orphaned S3 files with no database record
    console.log('--- Pass 2: Cleanup orphaned S3 files ---');

    // List all objects in the S3 bucket, paginated
    let continuationToken: string | undefined;
    const BATCH_SIZE = 1000;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        MaxKeys: BATCH_SIZE,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);

      const contents = listResponse.Contents ?? [];
      if (contents.length === 0) {
        continuationToken = listResponse.NextContinuationToken;
        continue;
      }

      totalObjectsChecked += contents.length;
      console.log(
        `📦 Processing batch of ${contents.length} objects (total: ${totalObjectsChecked})`,
      );

      // Batch DB check per page: collect all attachmentIds in this page
      const keyByAttachmentId = new Map<string, string>();
      for (const object of contents) {
        if (!object.Key) continue;
        const parsed = parseS3Key(object.Key);
        if (!parsed) continue;
        keyByAttachmentId.set(parsed.attachmentId, object.Key);
      }

      const pageAttachmentIds = Array.from(keyByAttachmentId.keys());
      let existingIds = new Set<string>();
      if (pageAttachmentIds.length > 0) {
        const existing = await prisma.attachment.findMany({
          where: { id: { in: pageAttachmentIds } },
          select: { id: true },
        });
        existingIds = new Set(existing.map((r) => r.id));
      }

      const orphanedKeys: string[] = [];
      for (const attachmentId of pageAttachmentIds) {
        if (!existingIds.has(attachmentId)) {
          const key = keyByAttachmentId.get(attachmentId);
          if (key) {
            orphanedKeys.push(key);
            totalOrphanedFiles++;
          }
        }
      }

      // Delete orphaned files in batches
      if (orphanedKeys.length > 0) {
        console.log(
          `🗑️ Found ${orphanedKeys.length} orphaned files in current batch, deleting...`,
        );

        const deleteResult = await deleteS3ObjectsByKeys(orphanedKeys);
        totalDeletedFiles += deleteResult.successful;

        if (deleteResult.errors.length > 0) {
          errors.push(...deleteResult.errors);
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    const errorMessage = `Orphan cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMessage}`);
    errors.push(errorMessage);
  }

  console.log(`✅ Cleanup completed:`);
  console.log(`   - Objects checked: ${totalObjectsChecked}`);
  console.log(`   - Orphaned files found: ${totalOrphanedFiles}`);
  console.log(`   - Files successfully deleted: ${totalDeletedFiles}`);
  console.log(`   - Errors encountered: ${errors.length}`);

  if (errors.length > 0) {
    console.error(`❌ Cleanup errors:`);
    errors.forEach((error) => console.error(`   - ${error}`));
  }

  return {
    body: {
      objectsChecked: totalObjectsChecked,
      orphanedFilesFound: totalOrphanedFiles,
      filesDeleted: totalDeletedFiles,
      errors: errors.length,
      errorMessages: errors,
    },
  };
};

// Event-triggered cleanup (manual/API trigger)
export const scheduledCleanupOrphanedFiles = inngest.createFunction(
  { id: 'cleanup-orphaned-files' },
  { event: 'app/cleanup.orphaned-files' },
  async () => {
    const result = await runOrphanCleanup();
    return {
      event: { name: 'app/cleanup.orphaned-files' },
      ...result,
    } as const;
  },
);

// Cron-scheduled cleanup (daily at 02:00 UTC)
export const scheduledCleanupOrphanedFilesCron = inngest.createFunction(
  { id: 'cleanup-orphaned-files-cron' },
  { cron: 'TZ=UTC 0 2 * * *' },
  async () => {
    const result = await runOrphanCleanup();
    return {
      event: { name: 'app/cleanup.orphaned-files.cron' },
      ...result,
    } as const;
  },
);
