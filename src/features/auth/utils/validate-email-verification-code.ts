import { prisma } from '@/lib/prisma';

export const validateEmailVerificationCode = async (
  code: string,
  userId: string,
  email: string,
) => {
  const emailVerificationToken = await prisma.emailVerificationToken.findFirst({
    where: {
      userId,
    },
  });
  if (!emailVerificationToken || emailVerificationToken.code !== code) {
    return false;
  }
  await prisma.emailVerificationToken.delete({
    where: {
      id: emailVerificationToken.id,
    },
  });

  const isExpired =
    emailVerificationToken.expiresAt.getTime() < new Date().getTime();
  if (isExpired) {
    return false;
  }
  // check email after deliting the token to ensureis it is the same as the one in the database beacause email must have changed so it should be required to send a new code - this acts as fail-safe mechanism, preventing verification if there's an unexpected missmatch in the stored email
  const isEmailValid = emailVerificationToken.email === email;
  if (!isEmailValid) {
    return false;
  }
  return true;
};
