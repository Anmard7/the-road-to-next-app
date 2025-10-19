import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CardCompact } from '@/components/card-compact';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { getAuth } from '@/features/auth/queries/get-auth';
import { passwordForgotPath, signUpPath, ticketsPath } from '@/paths';

const SignInPage = async () => {
  const { user } = await getAuth();
  if (user) {
    redirect(ticketsPath());
  }
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Sign In'
        description='Sign in to your account'
        content={<SignInForm />}
        footer={
          <div className='flex flex-1 justify-between'>
            <Link href={signUpPath()} className='text-muted-foreground text-sm'>
              No account yet?
            </Link>
            <Link
              className='text-muted-foreground text-sm'
              href={passwordForgotPath()}
            >
              Forgot Password?
            </Link>
          </div>
        }
      />
    </div>
  );
};

export default SignInPage;
