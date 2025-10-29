import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommentWithMetadata } from '../types';

type CommentItemProps = {
  comment: CommentWithMetadata;
  sections: { label: string; content: React.ReactNode }[];
  buttons?: React.ReactNode[];
};

const CommentItem = ({ comment, sections, buttons }: CommentItemProps) => {
  return (
    <div className='flex justify-between gap-1.5'>
      <Card className='flex w-full flex-col gap-y-1 p-4'>
        <div className='flex justify-between'>
          <p className='text-muted-foreground text-sm'>
            {comment.isOwner
              ? 'You'
              : (comment.user?.username ?? 'Deleted user')}
          </p>
          <p className='text-muted-foreground text-sm'>
            {format(comment.createdAt, 'yyyy-MM-dd HH:mm')}
          </p>
        </div>
        <p className='text-sm whitespace-pre-line'>{comment.content}</p>
        {sections.map((section) => (
          <div key={section.label}>
            <Separator />
            <h4 key={section.label} className='text-muted-foreground text-sm'>
              {section.label}
            </h4>
            <div className='text-sm'>{section.content}</div>
          </div>
        ))}
      </Card>

      {buttons && buttons.length > 0 && (
        <div className='flex flex-col gap-y-1'>
          {buttons.map((button) => button)}
        </div>
      )}
    </div>
  );
};

export { CommentItem };
