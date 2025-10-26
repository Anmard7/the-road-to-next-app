'use client';

import { LucideSquareX } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type PreviewItem } from '../hooks/use-file-preview';

type AttachmentPreviewListProps = {
  items: PreviewItem[];
  onRemove: (id: string) => void;
};

const AttachmentPreviewList = ({ items, onRemove }: AttachmentPreviewListProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
      {items.map((item) => (
        <div
          key={item.id}
          className='flex justify-between gap-1 rounded-md border p-1'
        >
          <div className='flex flex-col gap-1'>
            {item.isImage ? (
              <Image
                src={item.previewUrl ?? ''}
                alt={`Preview of ${item.file.name}`}
                className='bg-muted h-16 w-16 rounded object-cover'
                width={64}
                height={64}
              />
            ) : (
              <div className='bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded p-1 text-center text-xs'>
                Preview not available
              </div>
            )}
            <p className='w-16 truncate text-xs' title={item.file.name}>
              {item.file.name}
            </p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='xs'
            aria-label={`Remove ${item.file.name}`}
            onClick={() => onRemove(item.id)}
          >
            <LucideSquareX className='h-4 w-4' />
          </Button>
        </div>
      ))}
    </div>
  );
};

export { AttachmentPreviewList };
