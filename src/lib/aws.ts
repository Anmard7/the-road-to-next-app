import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

interface GetPresignedPutUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number;
}

interface PresignedUrlResponse {
  url: string;
  headers: Record<string, string>;
}

export async function getPresignedPutUrl({
  key,
  contentType,
  expiresIn = 60,
}: GetPresignedPutUrlOptions): Promise<PresignedUrlResponse> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  const url = await getSignedUrl(s3, command, { expiresIn });

  return {
    url,
    headers: {
      'Content-Type': contentType,
      'x-amz-server-side-encryption': 'AES256',
    },
  };
}
