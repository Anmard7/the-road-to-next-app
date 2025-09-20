'use client';

import { LucideKanban, LucideLogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/features/auth/actions/sign-out';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { homePath, signInPath, signUpPath, ticketsPath } from '@/path';
import { SubmitButton } from './form/submit-button';
import { ThemeSwitcher } from './theme/theme-switcher';
import { buttonVariants } from './ui/button';

const Header = () => {
  const { user, isfetched } = useAuth();

  if (!isfetched) return null;

  const navItems = user ? (
    <>
      <Link
        href={ticketsPath()}
        className={buttonVariants({ variant: 'outline' })}
      >
        Tickets
      </Link>
      <form action={signOut}>
        <SubmitButton label='Sign Out' icon={<LucideLogOut />} />
      </form>
    </>
  ) : (
    <>
      <Link
        href={signUpPath()}
        className={buttonVariants({ variant: 'outline' })}
      >
        Sign Up
      </Link>
      <Link
        href={signInPath()}
        className={buttonVariants({ variant: 'default' })}
      >
        Sign In
      </Link>
    </>
  );
  return (
    <nav className='animate-header-from-top supports-backdrop-blur:bg-background/60 bg-background/95 fixed top-0 right-0 left-0 z-20 flex w-full justify-between border-b px-5 py-2.5 backdrop-blur'>
      <div className='align-items flex gap-x-2'>
        <Link
          href={homePath()}
          className={buttonVariants({ variant: 'ghost' })}
        >
          <LucideKanban />
          <h1 className='text-lg font-semibold'>TicketBounty</h1>
        </Link>
      </div>
      <div className='align-items flex gap-x-2'>
        <ThemeSwitcher />
        {navItems}
      </div>
    </nav>
  );
};
export { Header };
