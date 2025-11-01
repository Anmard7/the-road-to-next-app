import { AttachmentEntity, AttachmentStatus } from '@/generated/prisma/client';
import { AttachmentCreateData, AttachmentCreateDataSchema } from '../types';

/**
 * Constructs the data payload for creating a new attachment record.
 * This helper centralizes the logic for building the initial `PENDING` state
 * of an attachment, ensuring consistency and type safety.
 *
 * @param entityId - The ID of the parent entity (either a Ticket or a Comment).
 * @param entity - The type of the parent entity ('TICKET' or 'COMMENT').
 * @param fileMetadata - An object containing the file's name, size, and content type.
 * @returns A validated data object for creating a new attachment.
 */
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
