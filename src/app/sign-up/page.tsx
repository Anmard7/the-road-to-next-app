import Link from 'next/link';
import { CardCompact } from '@/components/card-compact';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { signInPath } from '@/path';

const SignUpPage = () => {
  return (
    <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center'>
      <CardCompact
        className='animate-fade-from-top w-full'
        title='Sign Up'
        description='Create a new account to get started'
        content={<SignUpForm />}
        footer={
          <Link href={signInPath()} className='text-muted-foreground text-sm'>
            Already have an account? Sign In now.
          </Link>
        }
      />
    </div>
  );
};

export default SignUpPage;
