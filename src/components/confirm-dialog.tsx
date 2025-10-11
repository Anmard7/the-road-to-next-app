import { cloneElement, useActionState, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form } from './form/form';
import { SubmitButton } from './form/submit-button';
import { ActionState, EMPTY_ACTION_STATE } from './form/utils/to-action-state';

type UseConfirmDialogArgs = {
  title?: string;
  description?: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  trigger: React.ReactElement<{ onClick?: () => void }>;
  onSuccess?: (actionState: ActionState) => void;
};
const useConfirmDialog = ({
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. Make sure you understand the consequences.',
  action,
  trigger,
  onSuccess,
}: UseConfirmDialogArgs) => {
  const [isOpen, setIsOpen] = useState(false);

  const dialogTrigger = cloneElement(trigger, {
    onClick: () => setIsOpen((state) => !state),
  });
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const handleSuccess = (actionState: ActionState) => {
    // Only close dialog on success if there's no redirect
    // If action redirects, the page will change anyway
    if (actionState.status === 'SUCCESS') {
      setIsOpen(false);
      onSuccess?.(actionState);
    }
  };

  const handleError = () => {
    // Keep dialog open on error so user can retry
  };
  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Form
              action={formAction}
              actionState={actionState}
              onSuccess={handleSuccess}
              onError={handleError}
            >
              <SubmitButton label='Confirm' />
            </Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return [dialogTrigger, dialog] as const;
};
export { useConfirmDialog };
