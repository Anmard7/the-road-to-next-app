'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { setSessionCookie } from '@/features/auth/utils/session-cookie';
import { createSession } from '@/lib/lucia';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';
import { generateRandomToken } from '@/utils/crypto';
import { getAuthOrRedirect } from '../queries/get-auth-or-redirect';
import { validateEmailVerificationCode } from '../utils/validate-email-verification-code';

const emailVerificationSchema = z.object({
  code: z.string().length(8, { message: 'Code must be 8 characters long' }),
});

export const emailVerification = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect({
    checkEmailVerified: false,
  });
  try {
    const { code } = emailVerificationSchema.parse(
      Object.fromEntries(formData.entries()),
    );
    const validCode = await validateEmailVerificationCode(
      code,
      user.id,
      user.email,
    );
    if (!validCode) {
      return toActionState('ERROR', 'Invalid or expired code', formData);
    }
    
    // email verification
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });
    // create new session
    const sessionToken = generateRandomToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionCookie(sessionToken, session.expiresAt);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
  await setCookieByKey('toast', 'Email verified successfully');
  redirect(ticketsPath());
};
