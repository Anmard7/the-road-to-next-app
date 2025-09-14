import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/generated/prisma';
import { upsertTicket } from '../actions/upsert-ticket';

type TicketUpsertFormProps = {
  ticket?: Ticket;
};

const TicketUpsertForm = ({ ticket }: TicketUpsertFormProps) => {
  return (
    <form action={upsertTicket.bind(null, ticket?.id)} className='flex flex-col gap-y-2'>
      <Label htmlFor='title'>Title</Label>
      <Input type='text' name='title' id='title' defaultValue={ticket?.title} />
      <Label htmlFor='content'>Content</Label>
      <Textarea name='content' id='content' defaultValue={ticket?.content} />
      <Button type='submit'>{ticket ? 'Update' : 'Create'}</Button>
    </form>
  );
};

export { TicketUpsertForm };
