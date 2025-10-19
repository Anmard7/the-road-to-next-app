'use server';

import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';
import { getOrganisationsByUserId } from '../queries/get-organisations-by-user';

export const deleteOrganisation = async (organisationId: string) => {
  await getAuthOrRedirect();
  try {
    const organisations = await getOrganisationsByUserId();
    const canDelete = organisations.some(
      (organisation) => organisation.id === organisationId,
    );

    if (!canDelete) {
      return toActionState('ERROR', 'Not a member of this organisation');
    }
    await prisma.organisation.delete({
      where: { id: organisationId },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  return toActionState('SUCCESS', 'Organisation deleted');
};
