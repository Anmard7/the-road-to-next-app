// type guards for attachment entity to distinguish between ticket and commentat runtime

import z from 'zod';
import {
  AttachmentEntity,
  AttachmentStatus,
  Prisma,
} from '@/generated/prisma/client';

type AttachmentSubjectTicket = Prisma.TicketGetPayload<{
  select: {
    id: true;
    organisationId: true;
    userId: true;
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

export const AttachmentSubjectSchema = z.discriminatedUnion('entity', [
  z.object({
    entity: z.literal(AttachmentEntity.TICKET),
    ticketId: z.string(),
    commentId: z.undefined(),
  }),
  z.object({
    entity: z.literal(AttachmentEntity.COMMENT),
    commentId: z.string(),
    ticketId: z.undefined(),
  }),
]);

export type AttachmentData = z.TypeOf<typeof AttachmentSubjectSchema>;

export const AttachmentCreateDataSchema = z.discriminatedUnion('entity', [
  z
    .object({
      entity: z.literal(AttachmentEntity.TICKET),
      ticketId: z.cuid(),
      commentId: z.undefined().optional(),
      name: z.string().min(1),
      status: z.literal(AttachmentStatus.PENDING),
      contentType: z.string(),
      size: z.number().positive(),
    })
    .strict(),
  z
    .object({
      entity: z.literal(AttachmentEntity.COMMENT),
      commentId: z.cuid(),
      ticketId: z.undefined().optional(),
      name: z.string().min(1),
      status: z.literal(AttachmentStatus.PENDING),
      contentType: z.string(),
      size: z.number().positive(),
    })
    .strict(),
]);

export type AttachmentCreateData = z.infer<typeof AttachmentCreateDataSchema>;
