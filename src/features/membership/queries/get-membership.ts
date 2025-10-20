import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';

export const getMembership = async ({
  organisationId,
  userId,
}: {
  organisationId: string;
  userId: string;
}) => {
  await getAuthOrRedirect();

  const membership = await prisma.membership.findUnique({
    where: { membershipId: { organisationId, userId } },
  });
  return membership;
};
