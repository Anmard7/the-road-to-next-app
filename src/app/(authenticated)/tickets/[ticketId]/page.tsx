import { notFound } from 'next/navigation';
import { SearchParams } from 'nuqs/server';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { TicketItem } from '@/features/ticket/components/ticket-item';
import { getTicket } from '@/features/ticket/queries/get-ticket';
import { searchParamsCache } from '@/features/ticket/serach-params'; //includes editComment parser
import { homePath } from '@/path';


type TicketPageProps = {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<SearchParams>;
};

const TicketPage = async ({ params, searchParams }: TicketPageProps) => {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }
  const { editComment } = await searchParamsCache.parse(searchParams); 

  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Breadcrumbs
        breadcrumbs={[
          { title: 'Tickets', href: homePath() },
          { title: ticket.title },
        ]}
      />
      <Separator />
      <div className='animate-fade-from-top mx-auto w-full max-w-[580px]'>
        <TicketItem ticket={ticket} isDetail initialEditCommentId={editComment} />
      </div>
    </div>
  );
};

export default TicketPage;
