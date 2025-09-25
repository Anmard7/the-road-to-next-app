import { ParsedSearchParams } from '@/features/ticket/serach-params';
import { prisma } from '@/lib/prisma';

export const getTickets = async (
  userId: string | undefined,
  searchParams: ParsedSearchParams,
) => {
  return await prisma.ticket.findMany({
    where: {
      userId,
      title: {
        contains: searchParams.search,
        mode: 'insensitive',
      },
    },
    orderBy: {
      [searchParams.sortKey]: searchParams.sortValue,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
};
