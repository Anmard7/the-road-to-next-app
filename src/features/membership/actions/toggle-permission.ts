"use server";

import { revalidatePath } from "next/cache";
import { toActionState } from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { membershipsPath } from "@/paths";
import { getAdminOrRedirect } from "../queries/get-admin-or-redirect";

type PermissionKey = "canDeleteTicket" | "canUpdateTicket";

export const togglePermission = async ({
  userId,
  organisationId,
  permissionKey,
}: {
  userId: string;
  organisationId: string;
  permissionKey: PermissionKey;
}) => {
  await getAdminOrRedirect(organisationId);

  const where = {
    membershipId: {
      userId,
      organisationId,
    },
  };

  const membership = await prisma.membership.findUnique({
    where,
  });

  if (!membership) {
    return toActionState("ERROR", "Membership not found");
  }

  await prisma.membership.update({
    where,
    data: {
      [permissionKey]: membership[permissionKey] === true ? false : true,
    },
  });

  revalidatePath(membershipsPath(organisationId));

  return toActionState("SUCCESS", "Permission updated");
};