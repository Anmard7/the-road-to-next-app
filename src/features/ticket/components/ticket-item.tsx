import clsx from "clsx";
import { LucideSquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";
import { ticketPath } from "@/path";
import { TICKET_ICON } from "../constants";
import { Ticket } from "../types";


type TicketItemProps = {
  ticket: Ticket;
  isDetail?: boolean;
};

const TicketItem = ({ticket, isDetail}: TicketItemProps) => {

  const detailButton = (
    <Link 
      href={ticketPath(ticket.id)}
      className={buttonVariants({ variant: "outline", size: "icon" })}
    >
      <LucideSquareArrowOutUpRight className='h-4 w-4' />
    </Link>
  );
    return (
      <div
        className={clsx(
          "w-full flex gap-1.5", // Add bg-red-500 temporarily
          isDetail ? "max-w-xl" : "max-w-[420px]"
        )}
      >
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className=' flex gap-x-2'>
              <span>{TICKET_ICON[ticket.status]}</span>
              <span className='truncate'>{ticket.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className= {clsx("whitespace-break-spaces", isDetail ? "line-clamp-none" : "line-clamp-3")} >
              {ticket.content}
            </p>
          </CardContent>
        </Card>
        {isDetail ? null : <div className="shrink-0 flex flex-col gap-1.5">
          {detailButton}
        </div>}
      </div>
    );
}

export {TicketItem};