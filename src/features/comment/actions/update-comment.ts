'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { prisma } from '@/lib/prisma';
import { ticketPath } from '@/paths';

const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1024, 'Content cannot exceed 1024 characters'),
});

const updateComment = async (
  commentId: string,
  _actionState: ActionState,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect();
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || !isOwner(user, comment)) {
    return toActionState('ERROR', 'Not authorized');
  }

  let validatedData: z.infer<typeof updateCommentSchema>;
  try {
    validatedData = updateCommentSchema.parse(Object.fromEntries(formData));
  } catch (error) {
    return fromErrorToActionState(error);
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { content: validatedData.content },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  revalidatePath(ticketPath(comment.ticketId));
  return toActionState('SUCCESS', 'Comment updated');
};

export { updateComment };
