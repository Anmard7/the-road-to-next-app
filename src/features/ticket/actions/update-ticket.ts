'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';

const updateTicket = async (id: string, formData: FormData) => {
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();

  if (!title || !content) return; // simple guard; no UI errors for now

  await prisma.ticket.update({
    where: {
      id,
    },
    data: {
      title,
      content,
    },
  });
  revalidatePath(ticketsPath());
  redirect(ticketsPath());
};

export { updateTicket };
