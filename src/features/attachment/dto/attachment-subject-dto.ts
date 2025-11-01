import { AttachmentEntity } from "@/generated/prisma";
import { AttachmentSubject, isComment, isTicket } from "../types";

export type Type = {
  entity: AttachmentEntity;
  entityId: string;
  organisationId: string;
  userId: string | null;
  ticketId: string;
  commentId: string | null;
};

export const fromTicket = (
  ticket: AttachmentSubject | null,
) => {
  if (!ticket) {
    return null;
  }

  if (isTicket(ticket)) {
    return {
      entity: "TICKET" as AttachmentEntity,
      entityId: ticket.id,
      organisationId: ticket.organisationId,
      userId: ticket.userId,
      ticketId: ticket.id,
      commentId: null,
    };
  }

  return null;
};

export const fromComment = (
  comment: AttachmentSubject | null,
) => {
  if (!comment) {
    return null;
  }

  if (isComment(comment)) {
    return {
      entity: "COMMENT" as AttachmentEntity,
      entityId: comment.id,
      organisationId: comment.ticket.organisationId,
      userId: comment.userId,
      ticketId: comment.ticket.id,
      commentId: comment.id,
    };
  }

  return null;
};
