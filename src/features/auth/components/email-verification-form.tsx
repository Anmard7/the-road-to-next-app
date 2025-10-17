'use client';
import { Fragment, useActionState } from 'react';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { emailVerification } from '../actions/email-verification';

export const EmailVerificationForm = () => {
  const [actionState, action] = useActionState(
    emailVerification,
    EMPTY_ACTION_STATE,
  );
  return (
    <Form action={action} actionState={actionState}>
      <InputOTP maxLength={8} name='code' className='relative w-full'>
        {[...Array(4).keys()].map((group) => (
          <Fragment key={group}>
            <InputOTPGroup className='flex-1 relative min-w-0'>
              <InputOTPSlot index={2 * group} className='w-full shrink' />
              <InputOTPSlot index={2 * group + 1} className='w-full shrink' />
            </InputOTPGroup>
            {group < 3 && <InputOTPSeparator className='shrink-0' />}
          </Fragment>
        ))}
      </InputOTP>
      <FieldError actionState={actionState} name='code' />

      <SubmitButton label='Verify Email' />
    </Form>
  );
};
