import { prisma } from "@/lib/prisma";
import { emailInvitationPath } from "@/paths";
import { generateRandomToken, hashToken } from "@/utils/crypto";
import { getBaseUrl } from "@/utils/url";

export const generateInvitationLink = async (
  invitedByUserId: string,
  organisationId: string,
  email: string
) => {
  // Only revoke prior invitations for this organisation/email pair
  await prisma.invitation.deleteMany({
    where: {
      email,
      organisationId,
    },
  });

  const tokenId = generateRandomToken();
  const tokenHash = hashToken(tokenId);

  await prisma.invitation.create({
    data: {
      tokenHash,
      invitedByUserId,
      organisationId,
      email,
    },
  });

  const pageUrl = getBaseUrl() + emailInvitationPath();
  const emailInvitationLink = `${pageUrl}${tokenId}`;

  return emailInvitationLink;
};
