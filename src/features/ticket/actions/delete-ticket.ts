'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setCookieByKey } from '@/actions/cookies';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/paths';
import { getTicketPermissions } from '../permissions/get-ticket-permission';

export const deleteTicket = async (id: string) => {
  //await new Promise((resolve) => setTimeout(resolve, 2000));

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
    if (!permissions.canDeleteTicket) {
      return toActionState('ERROR', 'Not authorized');
    }

    // Query all attachments for this ticket BEFORE deletion
    // This is crucial because cascade delete will remove the data after deletion
    const attachments = await prisma.attachment.findMany({
      where: {
        ticketId: id,
      },
    });

    // Delete the ticket (this will cascade delete attachments)
    await prisma.ticket.delete({
      where: {
        id,
      },
    });

    // Send event to clean up S3 files (non-blocking, use try-catch to prevent failures)
    try {
      await inngest.send({
        name: 'app/ticket.deleted',
        data: {
          organisationId: ticket.organisationId,
          ticketId: id,
          attachments: attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
          })),
        },
      });
    } catch (eventError) {
      // Log error but don't fail the deletion
      console.error('Failed to send ticket deletion event:', eventError);
    }
  } catch (error) {
    return fromErrorToActionState(error);
  }

  revalidatePath(ticketsPath());
  await setCookieByKey('toast', 'Ticket deleted');
  redirect(ticketsPath());
};
