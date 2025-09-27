'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useActionState } from 'react';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateComment } from '../actions/update-comment';

type CommentEditFormProps = {
  commentId: string;
  initialContent: string;
};

const CommentEditForm = ({
  commentId,
  initialContent,
}: CommentEditFormProps) => {
  // Clear only the edit key (preserve search/sort/page)
  const [, setEditComment] = useQueryState(
    'editComment',
    parseAsString.withOptions({ shallow: true, clearOnDefault: true }), // shallow: true so that editor won’t trigger a full RSC pass or data refetch—snappier UX, no flicker and cheaper.
  );

  const [actionState, action] = useActionState(
    updateComment.bind(null, commentId),
    EMPTY_ACTION_STATE,
  );

  const handleSuccess = () => {
    setEditComment(null, { history: 'replace' });
  };

  const handleCancel = () => {
    setEditComment(null, { history: 'replace' });
  };

  return (
    <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
      <Textarea
        name='content'
        defaultValue={initialContent}
        className='min-h-24'
      />
      <FieldError actionState={actionState} name='content' />
      <div className='flex items-center gap-2'>
        <SubmitButton label='Save' />
        <Button type='button' variant='outline' onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export { CommentEditForm };
