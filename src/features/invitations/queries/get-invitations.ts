import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";

export const getInvitations = async (organisationId: string) => {
  await getAdminOrRedirect(organisationId);

  return await prisma.invitation.findMany({
    where: {
      organisationId,
    },
    select: {
      email: true,
      createdAt: true,
      organisationId: true,
      invitedByUser: {
        select: {
          email: true,
          username: true,
        },
      },
    },
  });
};