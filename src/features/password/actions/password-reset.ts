'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { prisma } from '@/lib/prisma';
import { signInPath } from '@/path';
import { hashToken } from '@/utils/crypto';
import { hashPassword } from '../utils/hash-and-verify';

const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(191, { message: 'Password cannot exceed 191 characters' }),
    confirmPassword: z
      .string()
      .min(6, {
        message: 'Confirm password must be at least 6 characters long',
      })
      .max(191, { message: 'Confirm password cannot exceed 191 characters' }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export const passwordReset = async (
  tokenId: string,
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const { password } = passwordResetSchema.parse({
      password: formData.get('password')?.toString(),
      confirmPassword: formData.get('confirmPassword')?.toString(),
    });

    const tokenHash = hashToken(tokenId);
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });
    if (passwordResetToken) {
      await prisma.passwordResetToken.delete({
        where: {
          tokenHash,
        },
      });
    }
    if (
      !passwordResetToken ||
      Date.now() >= passwordResetToken.expiresAt.getTime()
    ) {
      return toActionState(
        'ERROR',
        'Expired or invalid verification token',
        formData,
      );
    }
    await prisma.session.deleteMany({
      where: {
        userId: passwordResetToken.userId,
      },
    });
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: {
        id: passwordResetToken.userId,
      },
      data: {
        passwordHash,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  await setCookieByKey('toast', 'Password reset successful');
  redirect(signInPath());
};
