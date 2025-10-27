'use server';

import { revalidatePath } from 'next/cache';
import {
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { ticketPath } from '@/paths';
import { getOrganisationIdByAttachment } from '../utils/attachment-helper';

export const deleteAttachment = async (id: string) => {
  const { user } = await getAuthOrRedirect();

  const attachment = await prisma.attachment.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      ticket: true,
      comment: {
        include: {
          ticket: true,
        },
      },
    },
  });

  const subject = attachment.ticket ?? attachment.comment;

  if (!subject) {
    return toActionState('ERROR', 'Subject not found');
  }
  if (!isOwner(user, subject)) {
    return toActionState('ERROR', 'Not authorized');
  }

  try {
    await prisma.attachment.delete({
      where: {
        id,
      },
    });
    const organisationId = getOrganisationIdByAttachment(
      attachment.entity,
      subject,
    );
    await inngest.send({
      name: 'app/attachment.deleted',
      data: {
        organisationId,
        entityId: subject.id,
        entity: attachment.entity,
        fileName: attachment.name,
        attachmentId: id,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  revalidatePath(ticketPath(id));

  return toActionState('SUCCESS', 'Attachment deleted');
};
