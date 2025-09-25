import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { TicketItem } from '@/features/ticket/components/ticket-item';
import { getTicket } from '@/features/ticket/queries/get-ticket';
import { homePath } from '@/path';

type TicketPageProps = {
  params: Promise<{ ticketId: string }>;
};
const TicketPage = async ({ params }: TicketPageProps) => {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }
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
        <TicketItem ticket={ticket} isDetail />
      </div>
    </div>
  );
};

export default TicketPage;
