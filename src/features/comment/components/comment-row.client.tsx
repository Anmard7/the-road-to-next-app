// features/comment/components/comment-row.client.tsx
'use client';
import { parseAsString, useQueryState } from 'nuqs';
import { CommentWithMetadata } from '../types';
import { CommentDeleteButton } from './comment-delete-button';
import { CommentEditButton } from './comment-edit-button';
import { CommentEditForm } from './comment-edit-form';
import { CommentItem } from './comment-item'; // read-only body

// This client wrapper is to avoid the server re-render when the comment is edited (shallow: true).

type CommentRowProps = {
  comment: CommentWithMetadata;
  canEdit: boolean;
};

export function CommentRow({ comment, canEdit }: CommentRowProps) {
  const [editingId] = useQueryState(
    'editComment',
    parseAsString
      .withDefault('')
      .withOptions({ shallow: true, clearOnDefault: true }),
  );
  const isEditing = editingId === comment.id;

  if (isEditing && canEdit) {
    return (
      <CommentEditForm
        commentId={comment.id}
        initialContent={comment.content}
      />
    );
  }

  return (
    <CommentItem
      comment={comment}
      buttons={
        canEdit
          ? [
              <CommentEditButton key='edit' commentId={comment.id} />,
              <CommentDeleteButton key='delete' id={comment.id} />,
            ]
          : []
      }
    />
  );
}
