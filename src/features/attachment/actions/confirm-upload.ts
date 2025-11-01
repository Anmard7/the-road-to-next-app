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
import * as attachmentData from '../data';
import * as attachmentSubjectDTO from '../dto/attachment-subject-dto';
import { isComment, isTicket } from '../types';
import { generateS3Key } from '../utils/generate-s3-key';

export const confirmUpload = async (
  attachmentId: string,
): Promise<ActionState<{ attachmentId: string }>> => {
  try {
    const { user } = await getAuthOrRedirect();

    // Fetch attachment with ticket relation
    const attachment = await attachmentData.getAttachment(attachmentId, {
      includeTicket: true,
      includeComment: true,
    });

    if (!attachment) {
      return toActionState('ERROR', 'Attachment not found');
    }

    // Validate exactly one foreign key is set
    const hasTicket = !!attachment.ticketId;
    const hasComment = !!attachment.commentId;

    if (hasTicket === hasComment) {
      // Both true or both false
      return toActionState(
        'ERROR',
        'Invalid attachment: must belong to exactly one entity',
      );
    }

    // Ensure entity matches the foreign key
    if (attachment.entity === 'TICKET' && !hasTicket) {
      return toActionState('ERROR', 'Invalid attachment: entity mismatch');
    }
    if (attachment.entity === 'COMMENT' && !hasComment) {
      return toActionState('ERROR', 'Invalid attachment: entity mismatch');
    }

    let subject;
    switch (attachment.entity) {
      case 'TICKET':
        subject = attachmentSubjectDTO.fromTicket(attachment.ticket);
        break;
      case 'COMMENT':
        subject = attachmentSubjectDTO.fromComment(attachment.comment);
        break;
    }
    if (!subject || !attachment) {
      return toActionState('ERROR', 'Subject not found');
    }

    // Verify user is ticket owner (authorization)
    if (!isOwner(user, subject)) {
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
        organisationId: subject.organisationId,
        entityId: subject.entityId,
        entity: attachment.entity,
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
      include: { ticket: true, comment: true },
    });

    // Revalidate the ticket page to show the new attachment
    switch (attachment.entity) {
      case 'TICKET':
        if (attachment.ticket && isTicket(attachment.ticket)) {
          revalidatePath(ticketPath(attachment.ticket.id));
        }
        break;
      case 'COMMENT': {
        if (attachment.comment && isComment(attachment.comment)) {
          revalidatePath(ticketPath(attachment.comment.ticket.id));
        }
        break;
      }
    }

    return toActionState('SUCCESS', 'Upload confirmed', undefined, {
      attachmentId: updatedAttachment.id,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
