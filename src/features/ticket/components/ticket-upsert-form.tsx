'use client';
import { Label } from '@radix-ui/react-label';
import { useActionState } from 'react';
import { toast } from 'sonner';
import FieldError from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { useActionFeedback } from '@/components/form/hooks/use-action-feedback';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/generated/prisma';
import { upsertTicket } from '../actions/upsert-ticket';

type TicketUpsertFormProps = {
  ticket?: Ticket;
};
const TicketUpsertForm = ({ ticket }: TicketUpsertFormProps) => {
  const [actionState, action] = useActionState(
    upsertTicket.bind(null, ticket?.id),
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <Label htmlFor='title'>Title</Label>
      <Input
        type='text'
        name='title'
        id='title'
        defaultValue={
          actionState.payload?.get('title')?.toString() ?? ticket?.title
        }
        //required
      />
      <FieldError actionState={actionState} name='title' />

      <Label htmlFor='content'>Content</Label>
      <Textarea
        name='content'
        id='content'
        defaultValue={
          actionState.payload?.get('content')?.toString() ?? ticket?.content
        }
        //required
      />
      <FieldError actionState={actionState} name='content' />

      <SubmitButton label={ticket ? 'Update' : 'Create'} />
      {/* {actionState?.message && <p>{actionState.message}</p>} */}
    </Form>
  );
};

export { TicketUpsertForm };
