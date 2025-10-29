'use client';

import { LucideLoaderCircle, LucideTrash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { deleteAttachment } from '../actions/delete-attachment';

type AttachmentDeleteButtonProps = {
  id: string;
  onDeleteAttachment?: (id: string) => void;
};

const AttachmentDeleteButton = ({ id, onDeleteAttachment }: AttachmentDeleteButtonProps) => {
  const router = useRouter();
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: 'Delete attachment?',
    description: 'This will delete the attachment permanently.',
    action: deleteAttachment.bind(null, id),
    trigger: (isLoading) =>
      isLoading ? (
        <Button variant='ghost' size='xs'>
          <LucideLoaderCircle className='h-4 w-4 animate-spin' />
        </Button>
      ) : (
        <Button variant='ghost' size='xs'>
          <LucideTrash className='h-4 w-4' />
        </Button>
      ),
    onSuccess: () => {
      onDeleteAttachment?.(id);
      router.refresh();
    },
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { AttachmentDeleteButton };
