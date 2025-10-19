import { getAuth } from '@/features/auth/queries/get-auth';
import { prisma } from '@/lib/prisma';

export const getOrganisationsByUserId = async () => {
  const { user } = await getAuth();
  if (!user) {
    return [];
  }
  const organisations = await prisma.organisation.findMany({
    where: {
      memberships: {
        some: {
          userId: user.id,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      memberships: {
        where: {
          userId: user.id,
        },
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  return organisations.map(({ memberships, ...organisation }) => ({
    ...organisation,
    membershipByUser: memberships[0],
  }));
};
