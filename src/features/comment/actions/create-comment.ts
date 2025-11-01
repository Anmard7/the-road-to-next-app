'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import * as attachmentSubjectDTO from '@/features/attachment/dto/attachment-subject-dto';
import { fileSchema } from '@/features/attachment/schema/files';
import * as attachmentService from '@/features/attachment/service';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { ticketPath } from '@/paths';
import * as commentData from '../data';

const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1024, 'Content cannot exceed 1024 characters'),
  files: fileSchema,
});

export const createComment = async <T = unknown>(
  ticketId: string,
  _actionState: ActionState<T>,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect();

  let comment;

  try {
    const { content, files } = createCommentSchema.parse({
      content: formData.get('content'),
      files: formData.getAll('files'),
    });

    comment = await commentData.createComment({
      userId: user.id,
      ticketId: ticketId,
      content: content,
      options: {
        includeUser: true,
        includeTicket: true,
      },
    });
    if (!comment) {
      return toActionState<T>('ERROR', 'Comment not created');
    }

    const subject = attachmentSubjectDTO.fromComment(comment);

    if (!subject) {
      throw new Error('Attachment subject not found for comment');
    }
    await attachmentService.createAttachments({
      subject: subject,
      entity: 'COMMENT',
      entityId: comment.id,
      files,
    });
  } catch (error) {
    return fromErrorToActionState<T>(error);
  }

  revalidatePath(ticketPath(ticketId));

  return toActionState<T>('SUCCESS', 'Comment created', undefined, {
    ...comment,
    isOwner: true,
  } as T);
};
