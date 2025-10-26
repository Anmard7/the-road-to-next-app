import { LucidePlus } from 'lucide-react';
import { DialogForm } from '@/components/form/dialog-form';
import { FieldError } from '@/components/form/field-error';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createInvitation } from '../actions/create-invitation';

type InvitationCreateDialogProps = {
  organisationId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const InvitationCreateDialog = ({
  organisationId,
  open,
  setOpen,
}: InvitationCreateDialogProps) => {
  return (
    <DialogForm
      open={open}
      onOpenChange={setOpen}
      title='Invite Member'
      description='Invite a user by email to your organization'
      trigger={
        <Button>
          <LucidePlus className='h-4 w-4' />
          Invite Member
        </Button>
      }
      action={createInvitation.bind(null, organisationId)}
      initialState={EMPTY_ACTION_STATE}
      submitLabel='Invite'
      cancelLabel='Cancel'
    >
      {({ actionState }) => (
        <div className='grid gap-4 py-4'>
          <div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                Email
              </Label>
              <Input
                name='email'
                id='email'
                className='col-span-3'
                defaultValue={actionState.payload?.get('email')?.toString()}
                aria-invalid={Boolean(actionState.fieldErrors.email?.length)}
                aria-describedby='email-error'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <div />
              <div className='col-span-3'>
                <FieldError actionState={actionState} name='email' id='email-error' />
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogForm>
  );
};
