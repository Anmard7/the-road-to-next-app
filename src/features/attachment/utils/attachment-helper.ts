import { AttachmentEntity } from '@/generated/prisma';
import { AttachmentSubject, isComment, isTicket } from '../types';

export const getOrganisationIdByAttachment = (
  entity: AttachmentEntity,
  subject: null | AttachmentSubject,
) => {
  if (!subject) return '';

  let organisationId = '';
  switch (entity) {
    case 'TICKET': {
      if (isTicket(subject)) {
        organisationId = subject.organisationId;
      }
      break;
    }
    case 'COMMENT': {
      if (isComment(subject)) {
        organisationId = subject.ticket.organisationId;
      }
      break;
    }
  }

  return organisationId;
};
