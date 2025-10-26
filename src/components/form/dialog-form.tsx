'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from './form';
import { SubmitButton } from './submit-button';
import { ActionState, EMPTY_ACTION_STATE } from './utils/to-action-state';

type DialogFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  trigger: React.ReactElement; // will be wrapped in DialogTrigger asChild
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState> | ActionState;
  initialState?: ActionState;
  onSuccess?: (state: ActionState) => void;
  onError?: (state: ActionState) => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitButtonProps?: Omit<React.ComponentProps<typeof SubmitButton>, 'label'>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  contentProps?: React.ComponentProps<typeof DialogContent>;
  children: (args: { actionState: ActionState }) => React.ReactNode;
};

function DialogForm({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  action,
  initialState = EMPTY_ACTION_STATE,
  onSuccess,
  onError,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitButtonProps,
  cancelButtonProps,
  contentProps,
  children,
}: DialogFormProps) {
  const [actionState, formAction] = useActionState(action, initialState);

  const handleSuccess = (state: ActionState) => {
    onSuccess?.(state);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent {...contentProps}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <Form
          action={formAction}
          actionState={actionState}
          onSuccess={handleSuccess}
          onError={onError}
        >
          {children({ actionState })}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              {...cancelButtonProps}
            >
              {cancelLabel}
            </Button>
            <SubmitButton label={submitLabel} {...submitButtonProps} />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { DialogForm };
