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
import { toCent } from '@/utils/currency';

const upsertTicketSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(191, 'Title cannot exceed 191 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters long')
    .max(1024, 'Content cannot exceed 1024 characters'),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline is required'),
  bounty: z.coerce.number().positive('Bounty must be greater than 0'),
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
      deadline: formData.get('deadline')?.toString().trim(),
      bounty: formData.get('bounty')?.toString().trim(),
    });
    const dbData = {
      ...validatedData,
      bounty: toCent(validatedData.bounty),
    };
    await prisma.ticket.upsert({
      where: { id: id || '' },
      update: dbData,
      create: dbData,
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
