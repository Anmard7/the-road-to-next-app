import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import Link from 'next/link';
import { Attachment } from '@/generated/prisma';
import { attachmentDownloadPath } from '@/paths';

type AttachmentItemProps = {
  attachment: Attachment;
  buttons: React.ReactNode[];
};

const AttachmentItem = ({ attachment, buttons }: AttachmentItemProps) => {
  return (
    <div className='flex items-center justify-between'>
      <Link
        className='flex items-center gap-x-2 truncate text-sm'
        // trigger the route handler to download the file
        href={attachmentDownloadPath(attachment.id)}
      >
        <ArrowUpRightFromSquareIcon className='h-4 w-4' />
        {attachment.name}
      </Link>
      {buttons}
    </div>
  );
};

export { AttachmentItem };
