import { prisma } from '@/lib/prisma';

type CommentsProps = {
  ticketId: string;
};

export const getComments = async ({ ticketId }: CommentsProps) => {
  return await prisma.comment.findMany({
    where: {
      ticketId,
    },
    include: {
      user: {
        select: { username: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
