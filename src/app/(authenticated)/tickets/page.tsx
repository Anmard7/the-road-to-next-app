import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { CardCompact } from '@/components/card-compact';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { getAuth } from '@/features/auth/queries/get-auth';
import { getActiveOrganisation } from '@/features/organisation/queries/get-active-organisation';
import { TicketFilterSwitch } from '@/features/ticket/components/ticket-filter-switch';
import { TicketList } from '@/features/ticket/components/ticket-list';
import { TicketUpsertForm } from '@/features/ticket/components/ticket-upsert-form';
import { searchParamsCache } from '@/features/ticket/serach-params';

type TicketsPageProps = {
  searchParams: Promise<SearchParams>;
};
const TicketsPage = async ({ searchParams }: TicketsPageProps) => {
  const { user } = await getAuth();
  const activeOrganisation = await getActiveOrganisation();
  const organisationName = activeOrganisation?.name;
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title="My Tickets"
        description='All your tickets at one place'
        actions={
          activeOrganisation && organisationName ? (
            <TicketFilterSwitch organisationName={organisationName} />
          ) : null
        }
      />
      <div className='mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-y-8'>
        <CardCompact
          className='w-full self-center'
          title='Create Ticket'
          description='Create a new ticket to get started'
          content={<TicketUpsertForm />}
        />
        <Suspense fallback={<Spinner />}>
          <TicketList
            userId={user?.id}
            searchParams={await searchParamsCache.parse(searchParams)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default TicketsPage;
