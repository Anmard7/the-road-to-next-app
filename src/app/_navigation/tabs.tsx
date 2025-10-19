'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountPasswordPath, accountProfilePath } from '@/paths';

export const AccountTabs = () => {
  const pathname = usePathname();
  return (
    <Tabs value={pathname.split('/').at(-1) ?? 'profile'}>
      <TabsList>
        <TabsTrigger value='profile' asChild>
          <Link href={accountProfilePath()}>Profile</Link>
        </TabsTrigger>
        <TabsTrigger value='password' asChild>
          <Link href={accountPasswordPath()}>Password</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
