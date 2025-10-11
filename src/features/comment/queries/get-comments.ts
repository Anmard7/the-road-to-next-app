'use server';

import { getAuth } from '@/features/auth/queries/get-auth';
import { isOwner } from '@/features/auth/utils/is-owner';
import { prisma } from '@/lib/prisma';

export const getComments = async (
  ticketId: string,
  cursor?: { id: string; createdAt: number },
) => {
  const { user } = await getAuth();
  const where = {
    ticketId,
  };
  const limit = 2;
  const take = limit + 1; // We fetch one more item to check for a next page

  const [comments, count] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      take,
      cursor: cursor
        ? { createdAt: new Date(cursor.createdAt), id: cursor.id }
        : undefined,
      skip: cursor ? 1 : 0,
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    }),
    prisma.comment.count({
      where,
    }),
  ]);
 
 //We fetch one more item to check for a next page, so we can know if there is a next page or not.
 //If there is a next page, we remove the extra item from the comments array.
 //We return the comments array without the extra item.
 //We return the last comment in the comments array.
  const hasNextPage = comments.length > limit;
  const commentsWithoutExtraItem = hasNextPage ? comments.slice(0, -1) : comments;
  const lastComment = commentsWithoutExtraItem.at(-1);

  return {
    list: comments.map((comment) => ({
      ...comment,
      isOwner: isOwner(user, comment),
    })),
    metadata: {
      count,
      hasNextPage,
      cursor: lastComment
        ? {
            id: lastComment.id,
            createdAt: lastComment.createdAt.valueOf(),
          }
        : undefined,
    },
  };
};
