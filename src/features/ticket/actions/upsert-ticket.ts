'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as z from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { prisma } from '@/lib/prisma';
import { ticketPath, ticketsPath } from '@/path';

const upsertTicketSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(191, 'Title cannot exceed 191 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters long')
    .max(1024, 'Content cannot exceed 1024 characters'),
});
export const upsertTicket = async (
  id: string | undefined,
  _actionState: ActionState | undefined,
  formData: FormData,
) => {
  try {
    const validatedData = upsertTicketSchema.parse({
      title: formData.get('title')?.toString().trim(),
      content: formData.get('content')?.toString().trim(),
    });

    await prisma.ticket.upsert({
      where: { id: id || '' },
      update: validatedData,
      create: validatedData,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  revalidatePath(ticketsPath());

  if (id) {
    await setCookieByKey('toast', 'Ticket updated');
    redirect(ticketPath(id));
  }
  return toActionState('SUCCESS', 'Ticket created');
};
