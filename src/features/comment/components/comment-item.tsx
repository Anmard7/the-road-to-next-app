import { Card } from '@/components/ui/card';
import { CommentWithMetadata } from '../types';

type CommentItemProps = {
  comment: CommentWithMetadata;
  buttons?: React.ReactNode[];
  
};

const CommentItem = ({ comment, buttons = [] }: CommentItemProps) => {
  return (
    <div className='flex justify-between gap-1.5'>
      <Card className='flex w-full flex-col gap-y-1 p-4'>
        <div className='flex justify-between'>
          <p className='text-muted-foreground text-sm'>
            {comment.user?.username ?? 'Deleted user'}
          </p>
          <p className='text-muted-foreground text-sm'>
            {comment.createdAt.toLocaleString()}
          </p>
        </div>
        <p className='text-sm whitespace-pre-line'>{comment.content}</p>
      </Card>
      {buttons.length > 0 && (
        <div className='flex flex-col gap-y-1'>
          {buttons.map((button) => button)}
        </div>
      )}
    </div>
  );
};

export { CommentItem };
