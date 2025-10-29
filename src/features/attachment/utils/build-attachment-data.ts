import { AttachmentEntity, AttachmentStatus } from '@/generated/prisma/client';
import { AttachmentCreateData, AttachmentCreateDataSchema } from '../types';

export function buildAttachmentCreateData(
  entityId: string,
  entity: AttachmentEntity,
  fileMetadata: { name: string; size: number; contentType: string },
): AttachmentCreateData {
  const baseData = {
    name: fileMetadata.name,
    status: AttachmentStatus.PENDING,
    contentType: fileMetadata.contentType,
    size: fileMetadata.size,
  };

  const attachmentData: AttachmentCreateData =
    entity === AttachmentEntity.TICKET
      ? { ...baseData, entity: AttachmentEntity.TICKET, ticketId: entityId }
      : { ...baseData, entity: AttachmentEntity.COMMENT, commentId: entityId };

  return AttachmentCreateDataSchema.parse(attachmentData);
}
