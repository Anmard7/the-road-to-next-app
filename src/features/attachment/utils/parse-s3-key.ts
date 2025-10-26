export interface ParsedS3Key {
  organisationId: string;
  ticketId: string;
  fileName: string;
  attachmentId: string;
}

/**
 * Parse S3 key format: {organisationId}/{ticketId}/{fileName}-{attachmentId}
 * Returns structured object or null if the format is invalid
 */
export const parseS3Key = (key: string): ParsedS3Key | null => {
  // Expected format: organisationId/ticketId/fileName-attachmentId
  const parts = key.split('/');

  if (parts.length !== 3) {
    return null; // Invalid format
  }

  const [organisationId, ticketId, filePart] = parts;

  // Validate required parts are not empty
  if (!organisationId || !ticketId || !filePart) {
    return null;
  }

  // Split the file part to get fileName and attachmentId
  // Format: fileName-attachmentId (attachmentId is a CUID, so it should be 25 chars)
  const lastDashIndex = filePart.lastIndexOf('-');

  if (lastDashIndex === -1) {
    return null; // No dash found
  }

  const fileName = filePart.substring(0, lastDashIndex);
  const attachmentId = filePart.substring(lastDashIndex + 1);

  // Validate attachmentId is a valid CUID (25 characters, alphanumeric)
  if (
    !attachmentId ||
    attachmentId.length !== 25 ||
    !/^[a-z0-9]+$/.test(attachmentId)
  ) {
    return null;
  }

  return {
    organisationId,
    ticketId,
    fileName,
    attachmentId,
  };
};
