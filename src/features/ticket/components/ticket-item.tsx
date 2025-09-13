import clsx from 'clsx';
import { LucideSquareArrowOutUpRight, LucideTrash } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from '@/generated/prisma/client';
import { ticketPath } from '@/path';
import { deleteTicket } from '../actions/delete-ticket';
import { TICKET_ICON } from '../constants';

type TicketItemProps = {
  ticket: Ticket;
  isDetail?: boolean;
};

const TicketItem = ({ ticket, isDetail }: TicketItemProps) => {
  console.log('Where is this component being rendered? (TicketItem)');

  const detailButton = (
    <Link
      href={ticketPath(ticket.id)}
      className={buttonVariants({ variant: 'outline', size: 'icon' })}
    >
      <LucideSquareArrowOutUpRight className='h-4 w-4' />
    </Link>
  );

  const deleteButton = (
    <form action={deleteTicket.bind(null, ticket.id)}>
      <Button variant='outline' size='icon'>
        <LucideTrash className='h-4 w-4' />
        <span className='sr-only'>Delete ticket</span>
      </Button>
    </form>
  );

  return (
    <div
      className={clsx(
        'flex w-full gap-1.5',
        isDetail ? 'max-w-xl' : 'max-w-[420px]',
      )}
    >
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
      </Card>
      <div className='flex shrink-0 flex-col gap-1.5'>
        {isDetail ? deleteButton : detailButton}
      </div>
    </div>
  );
};

export { TicketItem };
