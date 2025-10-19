'use server';

import { redirect } from 'next/navigation';
import { deleteSessionCookie } from '@/features/auth/utils/session-cookie';
import { invalidateSession } from '@/lib/lucia';
import { signInPath } from '@/paths';
import { getAuth } from '../queries/get-auth';

export const signOut = async () => {
  const { session } = await getAuth();
  if (!session) {
    redirect(signInPath());
  }
  await invalidateSession(session.id);
  await deleteSessionCookie();
  redirect(signInPath());
};
