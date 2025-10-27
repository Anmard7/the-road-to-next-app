// type guards for attachment entity to distinguish between ticket and commentat runtime

import { Prisma } from '@/generated/prisma/client';

type AttachmentSubjectTicket = Prisma.TicketGetPayload<{
  select: {
    id: true;
    organisationId: true;
  };
}>;

type AttachmentSubjectComment = Prisma.CommentGetPayload<{
  include: {
    ticket: {
      select: {
        id: true;
        organisationId: true;
      };
    };
  };
}>;

export type AttachmentSubject =
  | AttachmentSubjectTicket
  | AttachmentSubjectComment;

export const isTicket = (
  subject: AttachmentSubject,
): subject is AttachmentSubjectTicket => {
  return 'organisationId' in subject;
};

export const isComment = (
  subject: AttachmentSubject,
): subject is AttachmentSubjectComment => {
  return 'ticket' in subject;
};
