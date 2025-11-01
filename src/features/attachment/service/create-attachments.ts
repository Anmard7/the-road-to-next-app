import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  type Attachment,
  AttachmentEntity,
  AttachmentStatus,
} from '@/generated/prisma/client';
import { s3 } from '@/lib/aws';
import { prisma } from '@/lib/prisma';
import * as attachmentData from '../data';
import * as attachmentSubjectDTO from '../dto/attachment-subject-dto';
import type { AttachmentCreateData } from '../types';
import { generateS3Key } from '../utils/generate-s3-key';

type CreateAttachmentsArgs = {
  subject: attachmentSubjectDTO.Type;
  entity: AttachmentEntity;
  entityId: string;
  files: File[];
};

export const createAttachments = async ({
  subject,
  entity,
  entityId,
  files,
}: CreateAttachmentsArgs) => {
  const attachments: Attachment[] = []; // collect created attachments
  const uploadedKeys: string[] = [];

  try {
    for (const file of files) {
      const buffer = await Buffer.from(await file.arrayBuffer());

      // upload file to S3
      const attachment = await attachmentData.createAttachment(
        entity === AttachmentEntity.TICKET
          ? {
              name: file.name,
              entity: AttachmentEntity.TICKET,
              status: AttachmentStatus.CONFIRMED,
              contentType: file.type,
              size: file.size,
              ticketId: entityId,
            }
          : {
              name: file.name,
              entity: AttachmentEntity.COMMENT,
              status: AttachmentStatus.CONFIRMED,
              contentType: file.type,
              size: file.size,
              commentId: entityId,
            },
      );

      const key = generateS3Key({
        organisationId: subject.organisationId,
        entityId,
        entity,
        fileName: file.name,
        attachmentId: attachment.id,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );
      attachments.push(attachment);
      uploadedKeys.push(key);
    }
  } catch (error) {
    console.log(error);
    //Rollback the S3 uploads
    await Promise.all(
      uploadedKeys.map(
        (key) =>
          s3
            .send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
              }),
            )
            .catch(() => null), // Don't crash during rollback
      ),
    );
    // Delete the attachments from the database
    await Promise.all(
      attachments.map((attachment) =>
        prisma.attachment
          .delete({ where: { id: attachment.id } })
          .catch(() => null),
      ),
    ); // Don't crash during rollback

    throw error;
  }
  return { attachments, uploadedKeys };
};

export const createPendingAttachment = async (data: AttachmentCreateData) => {
  return attachmentData.createAttachment(data);
};
