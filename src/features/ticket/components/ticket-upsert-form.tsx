'use client';
import { Label } from '@radix-ui/react-label';
import { useActionState, useRef } from 'react';
import {
  DatePicker,
  ImperativeHandleFormDatePicker,
} from '@/components/date-picker';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/generated/prisma';
import { fromCent } from '@/utils/currency';
import { upsertTicket } from '../actions/upsert-ticket';

type TicketUpsertFormProps = {
  ticket?: Ticket;
};
const TicketUpsertForm = ({ ticket }: TicketUpsertFormProps) => {
  const [actionState, action] = useActionState(
    upsertTicket.bind(null, ticket?.id),
    EMPTY_ACTION_STATE,
  );

  const datePickerImperativeHandleRef =
    useRef<ImperativeHandleFormDatePicker | null>(null);
  const handleSuccess = () => {
    datePickerImperativeHandleRef.current?.reset();
  };

  return (
    <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
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
      <div className='mb-1 flex gap-x-2'>
        <div className='w-1/2'>
          <Label htmlFor='deadline'>Deadline</Label>
          <DatePicker
            //key={actionState.timestamp} // to force re-render the date picker and reset the date
            name='deadline'
            id='deadline'
            defaultValue={
              actionState.payload?.get('deadline')?.toString() ??
              ticket?.deadline
            }
            ref={datePickerImperativeHandleRef}
          />

          <FieldError actionState={actionState} name='deadline' />
        </div>
        <div className='w-1/2'>
          <Label htmlFor='bounty'>Bounty ($)</Label>
          <Input
            type='number'
            name='bounty'
            id='bounty'
            step='0.01'
            defaultValue={
              actionState.payload?.get('bounty')?.toString() ??
              (ticket?.bounty ? fromCent(ticket?.bounty) : '')
            }
            //required
          />
          <FieldError actionState={actionState} name='bounty' />
        </div>
      </div>
      <SubmitButton label={ticket ? 'Update' : 'Create'} />
      {/* {actionState?.message && <p>{actionState.message}</p>} */}
    </Form>
  );
};

export { TicketUpsertForm };
