import { redirect } from 'next/navigation';
import { emailVerificationPath, signInPath } from '@/path';
import { getAuth } from './get-auth';

type getAuthOrRedirectOptions = {
  checkEmailVerified?: boolean;
}

export const getAuthOrRedirect = async (options?: getAuthOrRedirectOptions) => {
  const { checkEmailVerified = true } = options ?? {};

  const auth = await getAuth();
  if (!auth.user) {
    redirect(signInPath());
  }
  if (checkEmailVerified && !auth.user.emailVerified) {
    redirect(emailVerificationPath());
  }
  return auth;
};
