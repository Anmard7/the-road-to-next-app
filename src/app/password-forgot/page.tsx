import { CardCompact } from '@/components/card-compact';
import { PasswordForgotForm } from '@/features/password/components/password-forgot-form';

const PasswordForgotPage = () => {
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Forgot Password'
        description='Enter your email to reset your password'
        content={<PasswordForgotForm />}
      />
    </div>
  );
};

export default PasswordForgotPage;
