'use server';

import { revalidatePath } from 'next/cache';
import { setCookieByKey } from '@/actions/cookies';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { TicketStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/paths';
import { getTicketPermissions } from '../permissions/get-ticket-permission';

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  const { user } = await getAuthOrRedirect();
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket || !isOwner(user, ticket)) {
      return toActionState('ERROR', 'Not authorized');
    }
    const permissions = await getTicketPermissions({
      organisationId: ticket.organisationId,
      userId: user.id,
    });
    if (!permissions.canUpdateTicket) {
      return toActionState('ERROR', 'Not authorized');
    }
    await prisma.ticket.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
  revalidatePath(ticketsPath());
  await setCookieByKey('toast', 'Ticket status updated');
  return toActionState('SUCCESS', 'Status updated');
};
