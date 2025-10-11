'use client';
import { LucideLoaderCircle, LucideTrash } from 'lucide-react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { deleteComment } from '../actions/delete-comment';

type CommentDeleteButtonProps = {
  id: string;
  onDeleteComment: (id: string) => void;
};

const CommentDeleteButton = ({
  id,
  onDeleteComment,
}: CommentDeleteButtonProps) => {
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: 'Delete comment',
    action: deleteComment.bind(null, id),
    trigger: (isPending) => (
      <Button variant='outline' size='icon' disabled={isPending}>
        {isPending ? (
          <LucideLoaderCircle className='size-4 animate-spin' />
        ) : (
          <LucideTrash className='size-4' />
        )}
      </Button>
    ),
    onSuccess: () => onDeleteComment?.(id),
  });
  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { CommentDeleteButton };
