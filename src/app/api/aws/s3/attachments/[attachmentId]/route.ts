import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest } from 'next/server';
import { getOrganisationIdByAttachment } from '@/features/attachment/utils/attachment-helper';
import { generateS3Key } from '@/features/attachment/utils/generate-s3-key';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { s3 } from '@/lib/aws';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  await getAuthOrRedirect();

  const { attachmentId } = await params;

  const attachment = await prisma.attachment.findUniqueOrThrow({
    where: {
      id: attachmentId,
    },
    include: {
      ticket: true,
      comment: {
        include: {
          ticket: true,
        },
      },
    },
  });

  const subject = attachment.ticket ?? attachment.comment;
  if (!subject) {
    return new Response('Subject not found', { status: 404 });
  }
  const organisationId = getOrganisationIdByAttachment(
    attachment.entity,
    subject,
  );
  const presignedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateS3Key({
        organisationId,
        entityId: subject.id,
        entity: attachment.entity,
        fileName: attachment.name,
        attachmentId: attachment.id,
      }),
    }),
    { expiresIn: 5 * 60 }, // 5 minutes
  );

  const response = await fetch(presignedUrl);

  // download the file instead of displaying it in the browser
  const headers = new Headers();
  headers.append(
    'content-disposition',
    `attachment; filename="${attachment.name}"`,
  );

  return new Response(response.body, {
    headers,
  });
}
