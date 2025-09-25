import { Placeholder } from '@/components/placeholder';
import { ParsedSearchParams } from '@/features/ticket/serach-params';
import { getTickets } from '../queries/get-tickets';
import { TicketItem } from './ticket-item';
import { TicketPagination } from './ticket-pagination';
import { TicketSearchInput } from './ticket-search-input';
import { TicketSortSelect } from './ticket-sort-select';

type TicketListProps = {
  userId?: string;
  searchParams: ParsedSearchParams;
};
const TicketList = async ({ userId, searchParams }: TicketListProps) => {
  const { list: tickets, metadata: ticketMetadata } = await getTickets(
    userId,
    searchParams,
  );

  return (
    <div className='animate-fade-from-top flex w-full flex-1 flex-col gap-y-4'>
      <div className='flex gap-x-2'>
        <TicketSearchInput placeholder='Search tickets...' />
        <TicketSortSelect
          options={[
            {
              sortKey: 'createdAt',
              sortValue: 'desc',
              label: 'Newest',
            },
            {
              sortKey: 'createdAt',
              sortValue: 'asc',
              label: 'Oldest',
            },
            {
              sortKey: 'bounty',
              sortValue: 'desc',
              label: 'Bounty',
            },
          ]}
        />
      </div>
      {tickets.length ? (
        tickets.map((ticket) => <TicketItem key={ticket.id} ticket={ticket} />)
      ) : (
        <Placeholder label='No tickets found' />
      )}
      <div>
        <TicketPagination paginatedTicketMetadata={ticketMetadata} />
      </div>
    </div>
  );
};

export { TicketList };
