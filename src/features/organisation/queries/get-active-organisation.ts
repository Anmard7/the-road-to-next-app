import { getAuth } from '@/features/auth/queries/get-auth';
import { prisma } from '@/lib/prisma';

export const getActiveOrganisation = async () => {
  const { user } = await getAuth();
  if (!user) {
    return null;
  }
  const activeOrganisation = await prisma.organisation.findFirst({
    where: {
      memberships: {
        some: {
          userId: user.id,
          isActive: true,
        },
      },
    },
  });
  return activeOrganisation;
};
