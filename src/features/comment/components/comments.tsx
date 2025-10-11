'use client';

import { useState } from 'react';
import { CardCompact } from '@/components/card-compact';
import { Button } from '@/components/ui/button';
import { PaginatedData } from '@/types/pagination';
import { getComments } from '../queries/get-comments';
import { CommentWithMetadata } from '../types';
import { CommentDeleteButton } from './comment-delete-button';
import { CommentItem } from './comment-item';
import { CommentCreateForm } from './comments-create-form';

type CommentsProps = {
  ticketId: string;
  paginatedComments: PaginatedData<CommentWithMetadata>;
};
const Comments = ({ ticketId, paginatedComments }: CommentsProps) => {
  const [comments, setComments] = useState(paginatedComments.list);
  const [metadata, setMetadata] = useState(paginatedComments.metadata);

  const handleMore = async () => {
    const morePaginatedComments = await getComments(ticketId, metadata.cursor);
    const moreComments = morePaginatedComments.list;
    setComments([...comments, ...moreComments]);
    setMetadata(morePaginatedComments.metadata);
  };

  const handleDeleteComment = (id: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id),
    );
  };
  const handleCreateComment = (comment: CommentWithMetadata | undefined) => {
    if (!comment) return;
    setComments((prevComments) => [comment, ...prevComments]);
  };
  return (
    <>
      <CardCompact
        title='Create Comment'
        description='A new comment will be created for the ticket'
        content={
          <CommentCreateForm
            ticketId={ticketId}
            onCreateComment={handleCreateComment}
          />
        }
      />
      <div className='ml-8 flex flex-col gap-y-2'>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            buttons={[
              ...(comment.isOwner
                ? [
                    <CommentDeleteButton
                      key='0'
                      id={comment.id}
                      onDeleteComment={handleDeleteComment}
                    />,
                  ]
                : []),
            ]}
          />
        ))}
      </div>
      <div className='ml-8 flex flex-col justify-center'>
        {metadata.hasNextPage && (
          <Button variant='ghost' onClick={handleMore}>
            More
          </Button>
        )}
      </div>
    </>
  );
};

export { Comments };
