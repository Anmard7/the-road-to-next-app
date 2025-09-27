'use client';

import { LucidePencil } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';

type CommentEditButtonProps = {
  commentId: string;
};

const CommentEditButton = ({ commentId }: CommentEditButtonProps) => {
  const [, setEditComment] = useQueryState(
    'editComment',
    parseAsString.withDefault('').withOptions({ shallow: true, clearOnDefault: true }), // set shallow: true so the server doe not reacts/re-renders the page
  );

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      aria-label='Edit comment'
      onClick={() => setEditComment(commentId, { history: 'push' })}
    >
      <LucidePencil className='size-4' />
    </Button>
  );
};

export { CommentEditButton };
