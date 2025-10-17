import { CardCompact } from '@/components/card-compact';
import { EmailVerificationForm } from '@/features/auth/components/email-verification-form';
import { EmailVerificationResentForm } from '@/features/auth/components/email-verification-resent-form';

const EmailVerificationPage = async () => {
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Verify Your Email'
        description='Please verify your email to continue'
        content={
          <div className='flex flex-col gap-4'>
            <EmailVerificationForm />
            <EmailVerificationResentForm />
          </div>
        }
      />
    </div>
  );
};

export default EmailVerificationPage;
