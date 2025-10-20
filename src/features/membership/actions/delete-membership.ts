'use server';

import { toActionState } from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';
import { getMemberships } from '../queries/get-memberships';

/**
 * Deletes a membership from an organisation.
 *
 * This function performs several checks before deleting a membership:
 * 1. It ensures that the membership to be deleted is not the last one in the organisation.
 * 2. It verifies that the target membership exists.
 * 3. It prevents the deletion of the last admin in the organisation.
 * 4. It checks if the user performing the action is authorized to delete the membership.
 *    - An admin can delete any membership except for the last admin.
 *    - A user can delete their own membership.
 *
 * If any of these checks fail, it returns an error message.
 * Otherwise, it deletes the membership and returns a success message.
 *
 * @param {object} params - The parameters for the function.
 * @param {string} params.userId - The ID of the user whose membership is to be deleted.
 * @param {string} params.organisationId - The ID of the organisation from which the membership is to be deleted.
 * @returns {Promise<ActionState>} - A promise that resolves to an action state object, indicating success or failure.
 */
export const deleteMembership = async ({
  userId,
  organisationId,
}: {
  userId: string;
  organisationId: string;
}) => {
  // Ensure the user is authenticated, otherwise redirect to the sign-in page.
  const { user } = await getAuthOrRedirect();

  // Retrieve all memberships for the given organisation.
  const memberships = await getMemberships(organisationId);

  // Check if the membership to be deleted is the last one in the organisation.
  // An organisation must have at least one member.
  const isLastMembership = (memberships ?? []).length <= 1;
  if (isLastMembership) {
    return toActionState(
      'ERROR',
      'You cannot delete the last membership of an organization',
    );
  }

  // Find the specific membership that is targeted for deletion.
  const targetMembership = (memberships ?? []).find(
    (membership) => membership.userId === userId,
  );

  // If the target membership does not exist, return an error.
  if (!targetMembership) {
    return toActionState('ERROR', 'Membership not found');
  }

  // Check if the user is trying to delete the last admin of the organisation.
  // An organisation must have at least one admin to manage it.
  const adminMemberships = (memberships ?? []).filter(
    (membership) => membership.membershipRole === 'ADMIN',
  );
  const removesAdmin = targetMembership.membershipRole === 'ADMIN';
  const isLastAdmin = adminMemberships.length <= 1;

  if (removesAdmin && isLastAdmin) {
    return toActionState(
      'ERROR',
      'You cannot delete the last admin in the organisation',
    );
  }

  // Check if the current user is authorized to delete the membership.
  // Authorization is granted if the user is an admin or if they are deleting their own membership.
  const myMembership = (memberships ?? []).find(
    (membership) => membership.userId === user.id,
  );
  const isMyself = userId === user.id;
  const isAdmin = myMembership?.membershipRole === 'ADMIN';

  if (!isAdmin && !isMyself) {
    return toActionState(
      'ERROR',
      'You are not authorised to delete this membership',
    );
  }

  // If all checks pass, proceed with deleting the membership from the database.
  await prisma.membership.delete({
    where: {
      membershipId: {
        userId,
        organisationId,
      },
    },
  });

  // Return a success message, customized based on whether the user deleted their own membership or another's.
  return toActionState(
    'SUCCESS',
    isMyself
      ? 'You have left the organization'
      : 'The membership has been deleted',
  );
};
