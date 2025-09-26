import { deleteTicket } from '@/features/ticket/actions/delete-ticket';
import { getTicket } from '@/features/ticket/queries/get-ticket';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  if (!ticketId) {
    return new Response('Ticket ID is required', { status: 400 });
  }
  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return new Response('Ticket not found', { status: 404 });
  }
  return Response.json(ticket);
}
//TODO: Need to be authenticated and authorized to delete a ticket
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  if (!ticketId) {
    return new Response('Ticket ID is required', { status: 400 });
  }
  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return new Response('Ticket not found', { status: 404 });
  }
  await deleteTicket(ticketId);
  return new Response('Ticket deleted', { status: 200 });
}
