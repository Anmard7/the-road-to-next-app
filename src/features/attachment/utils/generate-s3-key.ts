type GenerateKeyArgs = {
  organisationId: string;
  ticketId: string;
  fileName: string;
  attachmentId: string;
};

export const generateS3Key = ({
  organisationId,
  ticketId,
  fileName,
  attachmentId,
}: GenerateKeyArgs) => {
  return `${organisationId}/${ticketId}/${fileName}-${attachmentId}`;
};