'use server';

import { verify } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { lucia } from '@/lib/lucia';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';

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

    const isValidPassword = await verify(user.passwordHash, password);

    if (!isValidPassword) {
      return toActionState('ERROR', 'Invalid email or password', formData);
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  redirect(ticketsPath());
};
