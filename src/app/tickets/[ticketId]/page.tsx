import { notFound } from 'next/navigation';
import { TicketItem } from '@/features/ticket/components/ticket-item';
import { getTicket } from '@/features/ticket/queries/get-ticket';

type TicketPageProps = {
  params: { ticketId: string };
};
const TicketPage = async ({ params }: TicketPageProps) => {
  const { ticketId } = params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }
  return (
    <div className='animate-fade-from-top flex justify-center'>
      <TicketItem ticket={ticket} isDetail />
    </div>
  );
};

export default TicketPage;
