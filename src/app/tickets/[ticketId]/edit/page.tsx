import { notFound } from 'next/navigation';
import { CardCompact } from '@/components/card-compact';
import { TicketUpdateForm } from '@/features/ticket/components/ticket-update-form';
import { getTicket } from '@/features/ticket/queries/get-ticket';

type TicketEditPageProps = {
  params: Promise<{ ticketId: string }>;
};

const TicketEditPage = async ({ params }: TicketEditPageProps) => {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Edit Ticket'
        description='Edit an existing ticket'
        content={<TicketUpdateForm ticket={ticket} />}
      />
    </div>
  );
};

export default TicketEditPage;
