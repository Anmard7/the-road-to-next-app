'use client';

import { Button } from './ui/button';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Select } from './ui/select';

type PageAndSize = {
  page: number;
  size: number;
};

type PaginationProps = {
  pagination: PageAndSize;
  onPageination: (pagination: PageAndSize) => void;
  paginatedTicketMetadata: {
    count: number;
    hasNextPage: boolean;
  };
};
export const Pagination = ({
  pagination,
  onPageination,
  paginatedTicketMetadata: { count, hasNextPage },
}: PaginationProps) => {
  const startOffset = pagination.page * pagination.size + 1;
  const endOffset = startOffset - 1 + pagination.size;
  const actualEndOffset = Math.min(endOffset, count);

  const label = `${startOffset} - ${actualEndOffset} of ${count}`;

  const handleNextPage = () => {
    onPageination({ ...pagination, page: pagination.page + 1 });
  };
  const handlePreviousPage = () => {
    onPageination({ ...pagination, page: pagination.page - 1 });
  };
  const handleSizeChange = (value: string) => {
    onPageination({ page: 0, size: parseInt(value) });
  };
  const nextButton = (
    <Button
      variant={'outline'}
      size={'sm'}
      disabled={!hasNextPage}
      onClick={handleNextPage}
    >
      Next
    </Button>
  );
  const previousButton = (
    <Button
      variant={'outline'}
      size={'sm'}
      disabled={pagination.page === 0}
      onClick={handlePreviousPage}
    >
      Previous
    </Button>
  );
  const sizeButton = (
    <Select
      defaultValue={pagination.size.toString()}
      onValueChange={handleSizeChange}
    >
      <SelectTrigger className='h-[36px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='5'>5</SelectItem>
        <SelectItem value='10'>10</SelectItem>
        <SelectItem value='20'>20</SelectItem>
        <SelectItem value='50'>50</SelectItem>
        <SelectItem value='100'>100</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className='flex items-center justify-between'>
      <p className='text-muted-foreground text-sm'>{label}</p>
      <div className='flex items-center gap-x-2'>
        {sizeButton}
        {previousButton}
        {nextButton}
      </div>
    </div>
  );
};
