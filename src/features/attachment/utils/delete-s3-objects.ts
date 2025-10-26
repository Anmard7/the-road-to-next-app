import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { s3 } from '@/lib/aws';

export interface DeletionResult {
  successful: number;
  failed: number;
  errors: string[];
}

export const deleteS3ObjectsByPrefix = async (
  prefix: string,
): Promise<DeletionResult> => {
  const result: DeletionResult = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  try {
    // List all objects with the given prefix, handling pagination
    const BATCH_SIZE = 1000; // AWS max per DeleteObjects
    let continuationToken: string | undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);
      const objects = listResponse.Contents ?? [];

      // Delete page objects in batches of 1000 (AWS limit)
      for (let i = 0; i < objects.length; i += BATCH_SIZE) {
        const batch = objects.slice(i, i + BATCH_SIZE);
        const keys: ObjectIdentifier[] = batch
          .filter((obj) => !!obj.Key)
          .map((obj) => ({ Key: obj.Key! }));

        if (keys.length === 0) continue;

        try {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: {
              Objects: keys,
            },
          });

          const deleteResponse = await s3.send(deleteCommand);

          // Count successes and failures
          if (deleteResponse.Deleted) {
            result.successful += deleteResponse.Deleted.length;
          }

          if (deleteResponse.Errors) {
            result.failed += deleteResponse.Errors.length;
            result.errors.push(
              ...deleteResponse.Errors.map(
                (error) => error.Message || 'Unknown error',
              ),
            );
          }
        } catch (error) {
          result.failed += keys.length;
          result.errors.push(
            `Batch deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    result.errors.push(
      `Failed to list objects: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return result;
};

export const deleteS3ObjectsByKeys = async (
  keys: string[],
): Promise<DeletionResult> => {
  const result: DeletionResult = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  if (keys.length === 0) {
    return result;
  }

  // Process keys in batches of 1000 (AWS limit)
  const BATCH_SIZE = 1000;

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    const objects: ObjectIdentifier[] = batch.map((key) => ({ Key: key }));

    try {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: objects,
        },
      });

      const deleteResponse = await s3.send(deleteCommand);

      // Count successes and failures
      if (deleteResponse.Deleted) {
        result.successful += deleteResponse.Deleted.length;
      }

      if (deleteResponse.Errors) {
        result.failed += deleteResponse.Errors.length;
        result.errors.push(
          ...deleteResponse.Errors.map(
            (error) => error.Message || 'Unknown error',
          ),
        );
      }
    } catch (error) {
      result.failed += batch.length;
      result.errors.push(
        `Batch deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  return result;
};
