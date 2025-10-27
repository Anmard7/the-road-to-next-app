'use client';

import { LucidePlus } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { DialogForm } from '@/components/form/dialog-form';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/generated/prisma';
import { upsertTicket } from '../actions/upsert-ticket';
import { TicketUpsertFields } from './ticket-upsert-form';

type TicketUpsertDialogProps = {
  ticket?: Ticket;
  trigger?: ReactElement;
  title?: string;
  description?: string;
};

const TicketUpsertDialog = ({
  ticket,
  trigger,
  title = ticket ? 'Edit Ticket' : 'Create Ticket',
  description = ticket
    ? 'Update your ticket information'
    : 'Create a new ticket to get started',
}: TicketUpsertDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogForm
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={
        trigger ?? (
          <Button className='w-full'>
            <LucidePlus className='mr-2 h-4 w-4' />
            {ticket ? 'Edit Ticket' : 'Create Ticket'}
          </Button>
        )
      }
      action={upsertTicket.bind(null, ticket?.id)}
      initialState={EMPTY_ACTION_STATE}
      submitLabel={ticket ? 'Update' : 'Create'}
    >
      {({ actionState }) => (
        <TicketUpsertFields actionState={actionState} ticket={ticket} />
      )}
    </DialogForm>
  );
};

export { TicketUpsertDialog };
