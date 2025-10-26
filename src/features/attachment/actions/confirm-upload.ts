'use server';

import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { s3 } from '@/lib/aws';
import { prisma } from '@/lib/prisma';
import { ticketPath } from '@/paths';
import { generateS3Key } from '../utils/generate-s3-key';

export const confirmUpload = async (
  attachmentId: string,
): Promise<ActionState<{ attachmentId: string }>> => {
  try {
    const { user } = await getAuthOrRedirect();

    // Fetch attachment with ticket relation
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return toActionState('ERROR', 'Attachment not found');
    }

    // Verify user is ticket owner (authorization)
    if (!isOwner(user, attachment.ticket)) {
      return toActionState('ERROR', 'Not authorized to confirm this upload');
    }

    // Only pending attachments can be confirmed
    if (attachment.status !== 'PENDING') {
      return toActionState('ERROR', 'Attachment is not in pending state');
    }

    // Verify S3 object exists
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateS3Key({
        organisationId: attachment.ticket.organisationId,
        ticketId: attachment.ticket.id,
        fileName: attachment.name,
        attachmentId: attachment.id,
      }),
    });

    let s3Metadata;
    try {
      s3Metadata = await s3.send(headCommand);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFound') {
        return toActionState('ERROR', 'File not found in S3');
      }
      throw error; // rethrow other errors
    }

    // Validate S3 metadata matches attachment record
    if (
      attachment.size &&
      s3Metadata.ContentLength &&
      s3Metadata.ContentLength !== attachment.size
    ) {
      return toActionState('ERROR', 'File size mismatch');
    }

    if (
      attachment.contentType &&
      s3Metadata.ContentType &&
      s3Metadata.ContentType !== attachment.contentType
    ) {
      return toActionState('ERROR', 'File type mismatch');
    }

    // Update attachment status to CONFIRMED and store ETag
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        status: 'CONFIRMED',
        etag: s3Metadata.ETag,
      },
      include: { ticket: true },
    });

    // Revalidate the ticket page to show the new attachment
    revalidatePath(ticketPath(updatedAttachment.ticket.id));

    return toActionState('SUCCESS', 'Upload confirmed', undefined, {
      attachmentId: updatedAttachment.id,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
