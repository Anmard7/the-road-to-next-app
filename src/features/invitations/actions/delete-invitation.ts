'use server';

import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAdminOrRedirect } from '@/features/membership/queries/get-admin-or-redirect';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type DeleteInvitationParams = {
  email: string;
  organisationId: string;
};

export const deleteInvitation = async ({
  email,
  organisationId,
}: DeleteInvitationParams) => {
  try {
    await getAdminOrRedirect(organisationId);

    // Use composite primary key (invitationId) for a precise delete
    await prisma.invitation.delete({
      where: { invitationId: { organisationId, email } },
    });

    return toActionState('SUCCESS', 'Invitation deleted');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return toActionState('ERROR', 'Invitation not found');
    }
    return fromErrorToActionState(error);
  }
};
