import { getAuth } from '@/features/auth/queries/get-auth';
import { isOwner } from '@/features/auth/utils/is-owner';
import { prisma } from '@/lib/prisma';
import { getTicketPermissions } from '../permissions/get-ticket-permission';

export const getTicket = async (ticketId: string) => {
  //await new Promise((resolve) => setTimeout(resolve, 2000));

  const { user } = await getAuth();

  const ticket = await prisma.ticket.findUnique({
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

  if (!ticket) {
    return null;
  }
  const permissions = await getTicketPermissions({
    organisationId: ticket.organisationId,
    userId: user?.id,
  });
  return {
    ...ticket,
    isOwner: isOwner(user, ticket),
    permissions: {
      canDeleteTicket: isOwner(user, ticket) && !!permissions.canDeleteTicket,
      canUpdateTicket: isOwner(user, ticket) && !!permissions.canUpdateTicket,
    },
  };
};
