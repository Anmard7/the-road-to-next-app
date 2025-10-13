'use server';

import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { prisma } from '@/lib/prisma';
import { sendEmailPasswordReset } from '../emails/send-email-password-reset';
import { generatePasswordResetLink } from '../utils/generate-password-reset-link';

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

    const passwordResetLink = await generatePasswordResetLink(user.id);

    // Send reset email
    await sendEmailPasswordReset(user.username, user.email, passwordResetLink);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  return toActionState(
    'SUCCESS',
    'Check your email for a reset link',
    formData,
  );
};
