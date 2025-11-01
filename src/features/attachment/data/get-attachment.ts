import { Attachment, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type TicketInclude = {
  ticket: true
 };

type CommentInclude = {
  comment: {
    include: {
      ticket: true
    };
  };
};

type TicketAndCommentInclude = TicketInclude & CommentInclude;

type IncludeOptions = {
  includeTicket?: boolean;
  includeComment?: boolean;
};

type AttachmentPayload<T extends IncludeOptions | undefined> = T extends {
  includeTicket: true;
  includeComment: true;
}
  ? Prisma.AttachmentGetPayload<{ include: TicketAndCommentInclude }>
  : T extends { includeTicket: true }
    ? Prisma.AttachmentGetPayload<{ include: TicketInclude }>
    : T extends { includeComment: true }
      ? Prisma.AttachmentGetPayload<{ include: CommentInclude }>
      : Attachment;

export async function getAttachment<T extends IncludeOptions | undefined>(
  id: string,
  options?: T,
): Promise<AttachmentPayload<T> | null> {

  const includeTicket = options?.includeTicket && {
    ticket: true
  };

  const includeComment = options?.includeComment && {
    comment: {
      include: {
        ticket: true
      },
    },
  };
  
  const attachment = await prisma.attachment.findUnique({
    where: {
      id,
    },
    include: {
      ...(includeTicket ?? {}),
      ...(includeComment ?? {}),
    },
  });

  return attachment as AttachmentPayload<T> | null;
}
