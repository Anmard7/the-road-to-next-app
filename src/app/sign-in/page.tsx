import Link from 'next/link';
import { CardCompact } from '@/components/card-compact';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { passwordForgotPath, signUpPath } from '@/path';

const SignInPage = () => {
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Sign In'
        description='Sign in to your account'
        content={<SignInForm />}
        footer={
          <div className='flex-1 flex justify-between'>
            <Link href={signUpPath()} className='text-muted-foreground text-sm'>
              No account yet?
            </Link>
            <Link
              className='text-muted-foreground text-sm'
              href={passwordForgotPath()}
            >
              Forgot Password?.
            </Link>
          </div>
        }
      />
    </div>
  );
};

export default SignInPage;
