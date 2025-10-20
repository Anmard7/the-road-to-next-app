'use server';

import { redirect } from 'next/navigation';
import z from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/paths';

const createOrganisationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(191, 'Name cannot exceed 191 characters'),
});

export const createOrganisation = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect({
    checkOrganisation: false,
    checkActiveOrganisation: false,
  });

  try {
    const data = createOrganisationSchema.parse({
      name: formData.get('name')?.toString(),
    });
    // create organisation and ensure new membership is active while others are deactivated
    await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          ...data,
          memberships: {
            create: {
              userId: user.id,
              isActive: true,
              membershipRole: 'ADMIN',
            },
          },
        },
      });
      // deactivate all other memberships for the user
      await tx.membership.updateMany({
        where: { userId: user.id, organisationId: { not: organisation.id } },
        data: { isActive: false },
      });
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
  await setCookieByKey('toast', 'Organisation created');
  redirect(ticketsPath());
};
