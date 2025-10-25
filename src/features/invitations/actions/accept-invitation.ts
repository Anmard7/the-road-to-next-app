'use server';

import { redirect } from 'next/navigation';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { prisma } from '@/lib/prisma';
import { signInPath } from '@/paths';
import { hashToken } from '@/utils/crypto';

export const acceptInvitation = async (tokenId: string) => {
  try {
    const tokenHash = hashToken(tokenId);

    const invitation = await prisma.invitation.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!invitation) {
      return toActionState('ERROR', 'Revoked or invalid verification token');
    }

    const user = await prisma.user.findUnique({
      where: {
        email: invitation.email,
      },
    });
    // if user exists, create membership for them
    if (user) {
      await prisma.$transaction([
        prisma.invitation.delete({
          where: {
            tokenHash,
          },
        }),
        prisma.membership.create({
          data: {
            organisationId: invitation.organisationId,
            userId: user.id,
            membershipRole: 'MEMBER',
            isActive: false,
          },
        }),
      ]);
    } else {
      // for a user without an account, update the invitation status
      // this status is later picked up by the Inngest fan-out job
      // listening to 'app/auth.sign-up' to create membership
      await prisma.invitation.update({
        where: {
          tokenHash,
        },
        data: {
          status: 'ACCEPTED_WITHOUT_ACCOUNT',
        },
      });
    }
  } catch (error) {
    return fromErrorToActionState(error);
  }

  // Always redirect to sign-in to streamline the flow
  redirect(signInPath());
};
