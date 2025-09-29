import { notFound } from 'next/navigation';
import { SearchParams } from 'nuqs/server';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { getComments } from '@/features/comment/queries/get-comments';
import { TicketItem } from '@/features/ticket/components/ticket-item';
import { getTicket } from '@/features/ticket/queries/get-ticket';
import { searchParamsCache } from '@/features/ticket/serach-params'; //includes editComment parser
import { homePath } from '@/path';

type TicketPageProps = {
  params: { ticketId: string };
  searchParams: Promise<SearchParams>;
};

const TicketPage = async ({ params, searchParams }: TicketPageProps) => {
  const ticketPromise = getTicket(params.ticketId);
  const commentsPromise = getComments(params.ticketId);

  // Parallel execution of the two promises, it's more efficient than waiting for one to finish before starting the other
  const [ticket, comments] = await Promise.all([
    ticketPromise,
    commentsPromise,
  ]);

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
        <TicketItem
          ticket={ticket}
          isDetail
          comments={comments}
          initialEditCommentId={editComment}
        />
      </div>
    </div>
  );
};

export default TicketPage;
