import { CardCompact } from '@/components/card-compact';
import { getAuth } from '@/features/auth/queries/get-auth';
import { isOwner } from '@/features/auth/utils/is-owner';
import { getComments } from '../queries/get-comments';
import { CommentDeleteButton } from './comment-delete-button';
import { CommentEditButton } from './comment-edit-button';
import { CommentEditForm } from './comment-edit-form';
import { CommentItem } from './comment-item';
import { CommentRow } from './comment-row.client';
import { CommentCreateForm } from './comments-create-form';

type CommentsProps = {
  ticketId: string;
  initialEditCommentId?: string;
};
const Comments = async ({
  ticketId,
  initialEditCommentId = '',
}: CommentsProps) => {
  const comments = await getComments({ ticketId });
  const { user } = await getAuth();

  return (
    <>
      <CardCompact
        title='Create Comment'
        description='A new comment will be created for the ticket'
        content={<CommentCreateForm ticketId={ticketId} />}
      />
      <div className='ml-8 flex flex-col gap-y-2'>
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            canEdit={isOwner(user, comment)}
          />
        ))}
      </div>
    </>
  );
};

export default Comments;
