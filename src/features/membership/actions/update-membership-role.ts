'use server';

import { revalidatePath } from 'next/cache';
import { toActionState } from '@/components/form/utils/to-action-state';
import { MembershipRole } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { membershipsPath } from '@/paths';
import { getAdminOrRedirect } from '../queries/get-admin-or-redirect';
import { getMemberships } from '../queries/get-memberships';

export const updateMembershipRole = async ({
  userId,
  organisationId,
  membershipRole,
}: {
  userId: string;
  organisationId: string;
  membershipRole: MembershipRole;
}) => {
  await getAdminOrRedirect(organisationId);

  const memberships = await getMemberships(organisationId);

  // Check if membership exists

  const targetMembership = (memberships ?? []).find(
    (membership) => membership.userId === userId,
  );

  if (!targetMembership) {
    return toActionState('ERROR', 'Membership not found');
  }

  // Check if user is deleting last admin

  const adminMemberships = (memberships ?? []).filter(
    (membership) => membership.membershipRole === 'ADMIN',
  );

  const removesAdmin = targetMembership.membershipRole === 'ADMIN';
  const isLastAdmin = adminMemberships.length <= 1;

  if (removesAdmin && isLastAdmin) {
    return toActionState(
      'ERROR',
      'You cannot remove the last admin of an organization',
    );
  }

  // Okay: Everything checked ...

  await prisma.membership.update({
    where: {
      membershipId: {
        userId,
        organisationId,
      },
    },
    data: {
      membershipRole,
    },
  });

  revalidatePath(membershipsPath(organisationId));

  return toActionState('SUCCESS', 'The role has been updated');
};
