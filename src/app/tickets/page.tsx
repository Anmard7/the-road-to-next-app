import { Suspense } from 'react';
import { CardCompact } from '@/components/card-compact';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { TicketList } from '@/features/ticket/components/ticket-list';
import { TicketUpsertForm } from '@/features/ticket/components/ticket-upsert-form';

const TicketsPage = async () => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading title='Tickets' description='All your tickets at one place' />
      <div className='mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-y-8'>
        <CardCompact
          className='w-full self-center'
          title='Create Ticket'
          description='Create a new ticket to get started'
          content={<TicketUpsertForm />}
        />
        <Suspense fallback={<Spinner />}>
          <TicketList />
        </Suspense>
      </div>
    </div>
  );
};

export default TicketsPage;
