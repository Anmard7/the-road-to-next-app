import { prisma } from '@/lib/prisma';

export const getTicket = async (ticketId: string) => {
  //await new Promise((resolve) => setTimeout(resolve, 2000));

  return await prisma.ticket.findUnique({
    where: {
      id: ticketId,
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
