'use server';

import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { sendEmailPasswordReset } from '../emails/send-email-password-reset';
import { generatePasswordResetLink } from '../utils/generate-password-reset-link';
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

    const isValidPassword = await verifyPasswordHash(
      auth.user.passwordHash,
      password,
    );

    if (!isValidPassword) {
      return toActionState('ERROR', 'Invalid password', formData);
    }
    const passwordResetLink = await generatePasswordResetLink(auth.user.id);

    // Send reset email
    await sendEmailPasswordReset(
      auth.user.username,
      auth.user.email,
      passwordResetLink,
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  return toActionState(
    'SUCCESS',
    'Check your email for a reset link',
    formData,
  );
};
