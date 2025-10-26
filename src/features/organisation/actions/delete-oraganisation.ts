'use server';

import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAdminOrRedirect } from '@/features/membership/queries/get-admin-or-redirect';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { getOrganisationsByUserId } from '../queries/get-organisations-by-user';

export const deleteOrganisation = async (organisationId: string) => {
  await getAdminOrRedirect(organisationId);
  try {
    const organisations = await getOrganisationsByUserId();
    const canDelete = organisations.some(
      (organisation) => organisation.id === organisationId,
    );

    if (!canDelete) {
      return toActionState('ERROR', 'Not a member of this organisation');
    }

    // Query all attachments for tickets in this organization BEFORE deletion
    // This is crucial because cascade delete will remove the data after deletion
    const attachments = await prisma.attachment.findMany({
      where: {
        ticket: {
          organisationId,
        },
      },
      include: {
        ticket: true,
      },
    });

    // Delete the organization (this will cascade delete tickets and attachments)
    await prisma.organisation.delete({
      where: { id: organisationId },
    });

    // Send event to clean up S3 files (non-blocking, use try-catch to prevent failures)
    try {
      await inngest.send({
        name: 'app/organisation.deleted',
        data: {
          organisationId,
          attachments: attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            ticketId: attachment.ticketId,
          })),
        },
      });
    } catch (eventError) {
      // Log error but don't fail the deletion
      console.error('Failed to send organization deletion event:', eventError);
    }
  } catch (error) {
    return fromErrorToActionState(error);
  }

  return toActionState('SUCCESS', 'Organisation deleted');
};
