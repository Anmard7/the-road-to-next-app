'use client';

import { LucidePlus } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { DialogForm } from '@/components/form/dialog-form';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { createOrganisation } from '../actions/create-organisation';
import { OrganisationNameFields } from './organisation-create-form';

type OrganisationCreateDialogProps = {
  trigger?: ReactElement;
  title?: string;
  description?: string;
};

const OrganisationCreateDialog = ({
  trigger,
  title = 'Create Organisation',
  description = 'Create an organisation to get started',
}: OrganisationCreateDialogProps) => {
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
            Create Organisation
          </Button>
        )
      }
      action={createOrganisation}
      initialState={EMPTY_ACTION_STATE}
      submitLabel='Create'
      cancelLabel='Cancel'
    >
      {({ actionState }) => (
        <OrganisationNameFields actionState={actionState} />
      )}
    </DialogForm>
  );
};

export { OrganisationCreateDialog };
