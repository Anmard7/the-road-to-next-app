import { Placeholder } from "@/components/placeholder";
import { getTickets } from "../queries/get-tickets";
import { TicketItem } from "./ticket-item";

const TicketList = async () => {
  const tickets = await getTickets();

  if (tickets.length === 0) {
    return <Placeholder label="No tickets yet" />;
  }

  return (
    <div className='flex-1 w-full flex flex-col gap-y-4 animate-fade-from-top'>
      {tickets.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};

export { TicketList };
