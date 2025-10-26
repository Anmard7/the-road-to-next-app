import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/aws';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { deleteS3ObjectsByKeys } from '../utils/delete-s3-objects';
import { parseS3Key } from '../utils/parse-s3-key';

// Event handler for manual or scheduled orphaned files cleanup
// To run as a cron job, you can trigger this via: inngest.send({ name: 'app/cleanup.orphaned-files', data: {} })
const runOrphanCleanup = async () => {
  console.log('🧹 Starting orphaned files cleanup job');

  let totalObjectsChecked = 0;
  let totalOrphanedFiles = 0;
  let totalDeletedFiles = 0;
  const errors: string[] = [];

  try {
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

  console.log(`✅ Orphan cleanup completed:`);
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
    return { event: { name: 'app/cleanup.orphaned-files' }, ...result } as const;
  },
);

// Cron-scheduled cleanup (daily at 02:00 UTC)
export const scheduledCleanupOrphanedFilesCron = inngest.createFunction(
  { id: 'cleanup-orphaned-files-cron' },
  { cron: 'TZ=UTC 0 2 * * *' },
  async () => {
    const result = await runOrphanCleanup();
    return { event: { name: 'app/cleanup.orphaned-files.cron' }, ...result } as const;
  },
);
