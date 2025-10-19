"use server";

import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

export const getActiveOrganisationSafe = async () => {
  const { user } = await getAuth();

  if (!user) {
    return null;
  }

  try {
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
    return { activeOrganisation };
  } catch {
    return { error: 'Error when retrieving active organisation' };
  }
};