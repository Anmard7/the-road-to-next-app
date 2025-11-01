import {
  AttachmentEntity,
  type AttachmentStatus,
} from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type BaseAttachmentFields = {
  name: string;
  status?: AttachmentStatus;
  contentType?: string;
  size?: number;
};

type CreateTicketAttachmentArgs = BaseAttachmentFields & {
  entity: typeof AttachmentEntity.TICKET;
  ticketId: string;
};

type CreateCommentAttachmentArgs = BaseAttachmentFields & {
  entity: typeof AttachmentEntity.COMMENT;
  commentId: string;
};

export type CreateAttachmentArgs =
  | CreateTicketAttachmentArgs
  | CreateCommentAttachmentArgs;

export const createAttachment = async (
  args: CreateAttachmentArgs,
) => {
  const { entity, name, status, contentType, size } = args;

  return prisma.attachment.create({
    data: {
      name,
      entity,
      status,
      contentType,
      size,
      ...(entity === AttachmentEntity.TICKET
        ? { ticketId: args.ticketId }
        : { commentId: args.commentId }),
    },
  });
};
