import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import initialTickets from "@/data";
import { TicketItem } from "@/features/ticket/components/ticket-item";
import { ticketsPath } from "@/path";

type TicketPageProps = {
    params: Promise<{
        tickestId: string;
    }>
}
const TicketPage = async({params}: TicketPageProps) => {
    const {tickestId} = await params;
    const ticket = initialTickets.find((ticket) => ticket.id === tickestId);

    if (!ticket) {
        return (
          <Placeholder 
            label="Ticket not found"
            button={
              <Button asChild variant="outline">
                <Link href={ticketsPath()}>Go to Tickets</Link>
              </Button>
          }/>
    )}
    return (
      
      <div className="flex justify-center animate-fade-from-top">
          <TicketItem ticket={ticket} isDetail />
      </div>
    )
}

export default TicketPage;