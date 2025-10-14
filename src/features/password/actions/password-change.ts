'use server';

import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { verifyPasswordHash } from '../utils/hash-and-verify';

const passwordChangeSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(191, { message: 'Password cannot exceed 191 characters' }),
});

export const passwordChange = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  const auth = await getAuthOrRedirect();
  try {
    const { password } = passwordChangeSchema.parse(
      Object.fromEntries(formData.entries()),
    );

    const user = await prisma.user.findUnique({
      where: { email: auth.user.email },
    });

    if (!user) {
      //We should never get here
      // but it's better to be safe than sorry
      return toActionState('ERROR', 'Invalid request', formData);
    }

    const isValidPassword = await verifyPasswordHash(
      user.passwordHash,
      password,
    );

    if (!isValidPassword) {
      return toActionState('ERROR', 'Invalid password', formData);
    }
    // Send inngest event to the message queue to trigger password change
    await inngest.send({
      name: 'app/password.password-reset',
      data: {
        userId: user.id,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  return toActionState(
    'SUCCESS',
    'Check your email for a reset link',
    formData,
  );
};
