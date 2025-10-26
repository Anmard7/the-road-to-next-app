import { CardCompact } from '@/components/card-compact';
import { getAttachments } from '../queries/get-attachments';
import { AttachmentCreateForm } from './attachment-create-form';
import { AttachmentDeleteButton } from './attachment-delete-button';
import { AttachmentList } from './attachment-list';

type AttachmentsProps = {
  ticketId: string;
  isOwner: boolean;
};

const Attachments = async ({ ticketId, isOwner }: AttachmentsProps) => {
  const attachments = await getAttachments(ticketId);
  return (
    <CardCompact
      title='Attachments'
      description='Attached images or PDFs'
      content={
        <>
          {/* list of attachments */}
          <AttachmentList
            attachments={attachments}
            //passing a function to generate buttons instead of passing the buttons directly as a prop because the buttons are dependent on the attachmentId
            buttons={(attachmentId: string) => [
              ...(isOwner
                ? [
                    <AttachmentDeleteButton
                      key="0"
                      id={attachmentId}
                    />,
                  ]
                : []),
            ]}
          />

          {/* create attachment form */}
          {isOwner && <AttachmentCreateForm ticketId={ticketId} />}
        </>
      }
    />
  );
};

export { Attachments };
