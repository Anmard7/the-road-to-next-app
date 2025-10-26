import { CardCompact } from '@/components/card-compact';
import { getAttachments } from '../queries/get-attachments';
import { AttachmentCreateForm } from './attachment-create-form';
import { AttachmentDeleteButton } from './attachment-delete-button';
import { AttachmentItem } from './attachment-item';

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
          <div className='mx-2 mb-4 flex flex-col gap-y-2'>
            {attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                buttons={[
                  ...(isOwner
                    ? [
                        <AttachmentDeleteButton
                          key={attachment.id}
                          id={attachment.id}
                        />,
                      ]
                    : []),
                ]}
              />
            ))}
          </div>

          {/* create attachment form */}
          {isOwner && <AttachmentCreateForm ticketId={ticketId} />}
        </>
      }
    />
  );
};

export { Attachments };
