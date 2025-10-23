import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { CardCompact } from '@/components/card-compact';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { TicketList } from '@/features/ticket/components/ticket-list';
import { TicketUpsertForm } from '@/features/ticket/components/ticket-upsert-form';
import { searchParamsCache } from '@/features/ticket/serach-params';

type TicketsByOrganisationPageProps = {
  searchParams: Promise<SearchParams>;
};

const TicketsByOrganisationPage = async ({
  searchParams,
}: TicketsByOrganisationPageProps) => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Our Tickets'
        description='All tickets for our organisation'
      />
      <div className='mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-y-8'>
        <CardCompact
          title='Create Ticket'
          description='A new ticket will be created for our organisation'
          className='w-full self-center'
          content={<TicketUpsertForm />}
        />
        <Suspense fallback={<Spinner />}>
          <TicketList
            byOrganisation={true}
            searchParams={searchParamsCache.parse(await searchParams)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default TicketsByOrganisationPage;
