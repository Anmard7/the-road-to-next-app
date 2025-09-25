import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { TicketList } from '@/features/ticket/components/ticket-list';
import { searchParamsCache } from '@/features/ticket/serach-params';

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};
const HomePage = async ({ searchParams }: HomePageProps) => {
  return (
    <div className='mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-y-8'>
      <Heading
        title='All Tickets'
        description='Tickets by everyone at one place'
      />
      <Suspense fallback={<Spinner />}>
        <TicketList
          searchParams={await searchParamsCache.parse(searchParams)}
        />
      </Suspense>
    </div>
  );
};

export default HomePage;
