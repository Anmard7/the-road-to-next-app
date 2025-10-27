import { AttachmentEntity } from '@/generated/prisma';

type GenerateKeyArgs = {
  organisationId: string;
  entityId: string;
  entity: AttachmentEntity;
  fileName: string;
  attachmentId: string;
};

// Sanitize file names to produce safe S3 key segments while preserving extension
const sanitizeFileName = (input: string): string => {
  if (!input) return 'file';

  // Remove control chars and trim
  let name = input.replace(/[\x00-\x1F\x7F]/g, '').trim();

  // Replace path separators
  name = name.replace(/[\\/]+/g, '-');

  // Split extension (last dot, but ignore leading dot files)
  const lastDot = name.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < name.length - 1;
  let base = hasExt ? name.slice(0, lastDot) : name;
  let ext = hasExt ? name.slice(lastDot + 1) : '';

  // Keep alphanum, dot, dash, underscore; replace others with '-'
  base = base.replace(/[^A-Za-z0-9._-]+/g, '-');
  // Collapse repeats and trim boundary punctuation
  base = base.replace(/[-_\.]{2,}/g, '-').replace(/^[._-]+|[._-]+$/g, '');

  // Sanitize extension to alphanum only and lower-case
  ext = ext.replace(/[^A-Za-z0-9]+/g, '').toLowerCase();

  // Length limits for readability and to avoid very long keys
  const MAX_BASE_LEN = 100;
  if (base.length === 0) base = 'file';
  if (base.length > MAX_BASE_LEN) base = base.slice(0, MAX_BASE_LEN);

  const sanitized = ext ? `${base}.${ext}` : base;
  return sanitized;
};

export const generateS3Key = ({
  organisationId,
  entityId,
  entity,
  fileName,
  attachmentId,
}: GenerateKeyArgs) => {
  const safeFileName = sanitizeFileName(fileName);
  return `${organisationId}/${entity}/${entityId}/${safeFileName}-${attachmentId}`;
};

export { sanitizeFileName };
