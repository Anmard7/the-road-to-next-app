'use server';

import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';

const passwordForgotSchema = z.object({
  email: z
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' })
    .max(191, { message: 'Email cannot exceed 191 characters' }),
});

export const passwordForgot = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const { email } = passwordForgotSchema.parse(
      Object.fromEntries(formData.entries()),
    );

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return toActionState('ERROR', 'Invalid email', formData);
    }

    // Send inngest event to the message queue to trigger password reset
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
