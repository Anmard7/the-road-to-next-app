'use client';

import { useActionState } from 'react';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { emailVerificationResent } from '../actions/email-verification-resend';

export const EmailVerificationResentForm = () => {
  const [actionState, action] = useActionState(
    emailVerificationResent,
    EMPTY_ACTION_STATE,
  );
  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton label='Resend Verification Code' variant='ghost' />
    </Form>
  );
};
