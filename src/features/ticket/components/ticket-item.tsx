import clsx from 'clsx';
import {
  LucideArrowUpRightFromSquare,
  LucideMoreVertical,
  LucidePencil,
} from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ticketEditPath, ticketPath } from '@/path';
import { toCurrencyFromCents } from '@/utils/currency';
import { TICKET_ICON } from '../constants';
import { TicketWithMetadata } from '../types';
import { TicketMoreMenu } from './ticket-more-menu';

type TicketItemProps = {
  ticket: TicketWithMetadata;
  isDetail?: boolean;
  comments?: React.ReactNode;
};

const TicketItem = ({
  ticket,
  isDetail,
  comments,
}: TicketItemProps) => {
  const detailButton = (
    <Button variant='outline' size='icon' asChild>
      <Link prefetch href={ticketPath(ticket.id)}>
        <LucideArrowUpRightFromSquare className='h-4 w-4' />
      </Link>
    </Button>
  );
  const editButton = ticket.isOwner ? (
    <Link
      prefetch
      href={ticketEditPath(ticket.id)}
      className={buttonVariants({ variant: 'outline', size: 'icon' })}
    >
      <LucidePencil className='h-4 w-4' />
    </Link>
  ) : null;

  const moreMenu = ticket.isOwner ? (
    <TicketMoreMenu
      ticket={ticket}
      trigger={
        <Button variant='outline' size='icon'>
          <LucideMoreVertical className='size-4' />
        </Button>
      }
    />
  ) : null;

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex w-full gap-1.5'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex gap-x-2'>
              <span>{TICKET_ICON[ticket.status]}</span>
              <span className='truncate'>{ticket.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={clsx(
                'whitespace-break-spaces',
                isDetail ? 'line-clamp-none' : 'line-clamp-3',
              )}
            >
              {ticket.content}
            </p>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <p className='text-muted-foreground text-sm'>
              {ticket.deadline} by {ticket.user.username}
            </p>
            <p className='text-muted-foreground text-sm'>
              {toCurrencyFromCents(ticket.bounty)}
            </p>
          </CardFooter>
        </Card>
        <div className='flex shrink-0 flex-col gap-1.5'>
          {isDetail ? (
            <>
              {editButton}
              {moreMenu}
            </>
          ) : (
            <>
              {detailButton}
              {editButton}
              {moreMenu}
            </>
          )}
        </div>
      </div>
      {comments}
    </div>
  );
};

export { TicketItem };
