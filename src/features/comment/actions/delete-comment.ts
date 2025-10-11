'use server';
import { revalidatePath } from 'next/cache';
import { setCookieByKey } from '@/actions/cookies';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { prisma } from '@/lib/prisma';
import { ticketPath } from '@/path';

export const deleteComment = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const { user } = await getAuthOrRedirect();
  const comment = await prisma.comment.findUnique({
    where: { id },
  });
  if (!comment || !isOwner(user, comment)) {
    return toActionState('ERROR', 'Not authorized');
  }
  try {
    await prisma.comment.delete({
      where: { id },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
  revalidatePath(ticketPath(comment.ticketId));
  await setCookieByKey('toast', 'Comment deleted');
  return toActionState('SUCCESS', 'Comment deleted');
};
