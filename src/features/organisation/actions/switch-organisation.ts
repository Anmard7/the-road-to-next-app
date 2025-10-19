'use server';

import { revalidatePath } from 'next/cache';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';
import { organisationsPath } from '@/paths';
import { getOrganisationsByUserId } from '../queries/get-organisations-by-user';

export const switchOrganisation = async (organisationId: string) => {
  const { user } = await getAuthOrRedirect({
    checkActiveOrganisation: false,
  });
  try {
    const organisations = await getOrganisationsByUserId();
    const canSwitch = organisations.some(
      (organisation) => organisation.id === organisationId,
    );

    if (!canSwitch) {
      return toActionState('ERROR', 'Not a member of this organisation');
    }
    await prisma.$transaction([
      // deactivate all memberships for the user
      prisma.membership.updateMany({
        where: { userId: user.id, organisationId: { not: organisationId } },
        data: { isActive: false },
      }),
      // activate the membership for the new organisation
      prisma.membership.update({
        where: {
          membershipId: {
            organisationId,
            userId: user.id,
          },
        },
        data: { isActive: true },
      }),
    ]);
  } catch (error) {
    return fromErrorToActionState(error);
  }
  revalidatePath(organisationsPath());
  return toActionState('SUCCESS', 'Active organisation has been switched');
};
