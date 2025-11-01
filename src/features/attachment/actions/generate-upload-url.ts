'use server';

import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { isOwner } from '@/features/auth/utils/is-owner';
import type { AttachmentEntity } from '@/generated/prisma/client';
import { getPresignedPutUrl } from '@/lib/aws';
import { ACCEPTED, MAX_SIZE } from '../constants';
import * as attachmentService from '../service';
import { buildAttachmentCreateData } from '../utils/build-attachment-data';
import { generateS3Key } from '../utils/generate-s3-key';
import { sizeInMB } from '../utils/size';

const generateUploadUrlSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string().min(1, 'Content type is required'),
});

interface GenerateUploadUrlResponse {
  url: string;
  headers: Record<string, string>;
  key: string;
  attachmentId: string;
}

export const generateUploadUrl = async (
  entityId: string,
  entity: AttachmentEntity,
  fileMetadata: unknown,
): Promise<ActionState<GenerateUploadUrlResponse>> => {
  try {
    const { user } = await getAuthOrRedirect();

    const subject = await attachmentService.getAttachmentSubject(
      entityId,
      entity,
    );

    if (!subject) {
      return toActionState('ERROR', 'Subject not found');
    }

    if (!isOwner(user, subject)) {
      return toActionState('ERROR', 'Not the owner of this subject');
    }

    const { name, size, type } = generateUploadUrlSchema.parse(fileMetadata);

    // Validate file metadata
    if (!ACCEPTED.includes(type)) {
      return toActionState('ERROR', 'File type is not supported');
    }

    if (sizeInMB(size) > MAX_SIZE) {
      return toActionState('ERROR', `The maximum file size is ${MAX_SIZE}MB`);
    }

    // Create pending attachment record
    const attachmentCreateData = buildAttachmentCreateData(entityId, entity, {
      name,
      size,
      contentType: type,
    });

    const attachment = await attachmentService.createPendingAttachment(
      attachmentCreateData,
    );

    // Generate S3 key
    const key = generateS3Key({
      organisationId: subject.organisationId,
      entityId,
      entity,
      fileName: name,
      attachmentId: attachment.id,
    });

    // Get presigned URL
    const { url, headers } = await getPresignedPutUrl({
      key,
      contentType: type,
      expiresIn: 60,
    });

    return toActionState('SUCCESS', 'Presigned URL generated', undefined, {
      url,
      headers,
      key,
      attachmentId: attachment.id,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
