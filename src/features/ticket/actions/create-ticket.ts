'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';

export const createTicket = async (formData: FormData) => {
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();

  if (!title || !content) return; // simple guard; no UI errors for now

  await prisma.ticket.create({
    data: {
      title,
      content,
    },
  });

  revalidatePath(ticketsPath());
};
