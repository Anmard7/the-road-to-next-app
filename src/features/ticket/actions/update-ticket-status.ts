'use server';

import { revalidatePath } from 'next/cache';
import { setCookieByKey } from '@/actions/cookies';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { TicketStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
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
