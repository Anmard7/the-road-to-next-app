'use client';
import { type RefObject, useActionState, useRef } from 'react';
import {
  DatePicker,
  ImperativeHandleFormDatePicker,
} from '@/components/date-picker';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from '@/components/form/utils/to-action-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/generated/prisma';
import { fromCent } from '@/utils/currency';
import { upsertTicket } from '../actions/upsert-ticket';

type TicketUpsertFormProps = {
  ticket?: Ticket;
};

type TicketUpsertFieldsProps = {
  actionState: ActionState;
  ticket?: Ticket;
  deadlineRef?: RefObject<ImperativeHandleFormDatePicker | null>;
};

const TicketUpsertFields = ({
  actionState,
  ticket,
  deadlineRef,
}: TicketUpsertFieldsProps) => {
  return (
    <>
      <Label htmlFor='title'>Title</Label>
      <Input
        type='text'
        name='title'
        id='title'
        defaultValue={
          actionState.payload?.get('title')?.toString() ?? ticket?.title
        }
        aria-invalid={Boolean(actionState.fieldErrors.title?.length)}
        aria-describedby='ticket-title-error'
      />
      <FieldError
        actionState={actionState}
        name='title'
        id='ticket-title-error'
      />

      <Label htmlFor='content'>Content</Label>
      <Textarea
        name='content'
        id='content'
        defaultValue={
          actionState.payload?.get('content')?.toString() ?? ticket?.content
        }
        aria-invalid={Boolean(actionState.fieldErrors.content?.length)}
        aria-describedby='ticket-content-error'
      />
      <FieldError
        actionState={actionState}
        name='content'
        id='ticket-content-error'
      />
      <div className='mb-1 flex gap-x-2'>
        <div className='w-1/2'>
          <Label htmlFor='deadline'>Deadline</Label>
          <DatePicker
            name='deadline'
            id='deadline'
            defaultValue={
              actionState.payload?.get('deadline')?.toString() ??
              ticket?.deadline
            }
            ref={deadlineRef}
            aria-invalid={Boolean(actionState.fieldErrors.deadline?.length)}
            aria-describedby='ticket-deadline-error'
          />

          <FieldError
            actionState={actionState}
            name='deadline'
            id='ticket-deadline-error'
          />
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
            aria-invalid={Boolean(actionState.fieldErrors.bounty?.length)}
            aria-describedby='ticket-bounty-error'
          />
          <FieldError
            actionState={actionState}
            name='bounty'
            id='ticket-bounty-error'
          />
        </div>
      </div>
    </>
  );
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
      <TicketUpsertFields
        actionState={actionState}
        ticket={ticket}
        deadlineRef={datePickerImperativeHandleRef}
      />
      <SubmitButton label={ticket ? 'Update' : 'Create'} />
    </Form>
  );
};

export { TicketUpsertFields, TicketUpsertForm };
