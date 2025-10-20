'use server';

import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';

export const getMemberships = async (organisationId: string) => {
  await getAuthOrRedirect();

  const memberships = await prisma.membership.findMany({
    where: { organisationId },
    include: {
      user: {
        select: {
          username: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });
  return memberships;
};
