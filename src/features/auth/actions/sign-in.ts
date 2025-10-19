'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { setSessionCookie } from '@/features/auth/utils/session-cookie';
import { verifyPasswordHash } from '@/features/password/utils/hash-and-verify';
import { createSession } from '@/lib/lucia';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/paths';
import { generateRandomToken } from '@/utils/crypto';

const signInSchema = z.object({
  email: z
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password is required' })
    .max(191, { message: 'Password cannot exceed 191 characters' }),
});

export const signIn = async (_actionState: ActionState, formData: FormData) => {
  try {
    const { email, password } = signInSchema.parse(
      Object.fromEntries(formData.entries()),
    );

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return toActionState('ERROR', 'Invalid email or password', formData);
    }

    const isValidPassword = await verifyPasswordHash(
      user.passwordHash,
      password,
    );

    if (!isValidPassword) {
      return toActionState('ERROR', 'Invalid email or password', formData);
    }

    const sessionToken = generateRandomToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionCookie(sessionToken, session.expiresAt);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  redirect(ticketsPath());
};
