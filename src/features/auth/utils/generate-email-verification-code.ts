import { prisma } from '@/lib/prisma';
import { generateRandomCode } from '@/utils/crypto';

const EMAIL_VERIFICATION_TOKEN_LIFETIME_MS = 1000 * 60 * 15; // 15 minutes

export const generateEmailVerificationCode = async (
  userId: string,
  email: string,
) => {

  // delete any existing email verification tokens for this user before creating a new one (1-1 relationship between user and email verification token)
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
    },
  });

  const code = generateRandomCode();

  // create email verification token
  await prisma.emailVerificationToken.create({
    data: {
      code,
      email,
      userId,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_LIFETIME_MS),
    },
  });

  return code;
};
