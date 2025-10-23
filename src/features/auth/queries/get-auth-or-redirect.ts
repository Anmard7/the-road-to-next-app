import { redirect } from 'next/navigation';
import { getOrganisationsByUserId } from '@/features/organisation/queries/get-organisations-by-user';
import {
  emailVerificationPath,
  onboardingPath,
  selectActiveOrganisationPath,
  signInPath,
} from '@/paths';
import { getAuth } from './get-auth';

type getAuthOrRedirectOptions = {
  checkEmailVerified?: boolean;
  checkOrganisation?: boolean;
  checkActiveOrganisation?: boolean;
};

export const getAuthAndRedirect = async () => {
  const auth = await getAuth();

  if (!auth.user) {
    redirect(signInPath());
  }

  return auth;
};

export const getAuthOrRedirect = async (options?: getAuthOrRedirectOptions) => {
  const {
    checkEmailVerified = true,
    checkOrganisation = true,
    checkActiveOrganisation = true,
  } = options ?? {};

  const auth = await getAuth();

  if (!auth.user) {
    redirect(signInPath());
  }
  if (checkEmailVerified && !auth.user.emailVerified) {
    redirect(emailVerificationPath());
  }

  // check organisation and active organisation if needed
  let activeOrganisation;

  if (checkOrganisation || checkActiveOrganisation) {
    const organisations = await getOrganisationsByUserId();

    if (checkOrganisation && !organisations.length) {
      redirect(onboardingPath());
    }

    activeOrganisation = organisations.find(
      (organisation) => organisation.membershipByUser.isActive,
    );

    const hasActive = !!activeOrganisation

    if (checkActiveOrganisation && !hasActive) {
      redirect(selectActiveOrganisationPath());
    }
  }

  return { ...auth, activeOrganisation };
};
