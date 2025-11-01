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
import * as attachmentData from '../data';
import * as attachmentSubjectDTO from '../dto/attachment-subject-dto';

export const deleteAttachment = async (id: string) => {
  const { user } = await getAuthOrRedirect();

  const attachment = await attachmentData.getAttachment(id, {
    includeTicket: true,
    includeComment: true,
  });

  let subject;
  switch (attachment?.entity) {
    case 'TICKET':
      subject = attachmentSubjectDTO.fromTicket(attachment.ticket);
      break;
    case 'COMMENT':
      subject = attachmentSubjectDTO.fromComment(attachment.comment);
      break;
  }
  if (!subject || !attachment) {
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

    await inngest.send({
      name: 'app/attachment.deleted',
      data: {
        organisationId: subject.organisationId,
        entityId: subject.entityId,
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
