import { prisma } from '@/lib/prisma';

type GetTicketPermissions = {
  organisationId: string | undefined;
  userId: string | undefined;
};

export const getTicketPermissions = async ({
  organisationId,
  userId,
}: GetTicketPermissions) => {
  if (!organisationId || !userId) {
    return {
      canDeleteTicket: false,
      canUpdateTicket: false,
    };
  }

  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId,
        organisationId,
      },
    },
  });

  if (!membership) {
    return {
      canDeleteTicket: false,
      canUpdateTicket: false,
    };
  }

  return {
    canDeleteTicket: membership.canDeleteTicket,
    canUpdateTicket: membership.canUpdateTicket,
  };
};
