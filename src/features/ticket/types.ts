export type TicketStatus = 'DONE' | 'OPEN' | 'IN_PROGRESS';

export type Ticket = {
  id: string;
  title: string;
  content: string;
  status: TicketStatus;
};