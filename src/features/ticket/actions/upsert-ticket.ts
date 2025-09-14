'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ticketPath, ticketsPath } from '@/path';

export const upsertTicket = async (
  id: string | undefined,
  formData: FormData,
) => {
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  if (!title || !content) return; // simple guard; no UI errors for now
  await prisma.ticket.upsert({
    where: { id: id || '' },
    update: { title, content },
    create: { title, content },
  });
  revalidatePath(ticketsPath());
  if (id) {
    redirect(ticketPath(id));
  }
};
