import { LucidePlus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { OrganisationList } from '@/features/organisation/components/organisation-list';
import { organisationCreatePath } from '@/paths';

const OrganisationPage = () => {
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Organisations'
        description='All your organisations at one place'
        actions={
          <>
            <Button asChild>
              <Link href={organisationCreatePath()}>
                <LucidePlus className='size-4' />
                Create Organisation
              </Link>
            </Button>
          </>
        }
      />
      <Suspense fallback={<Spinner />}>
        <OrganisationList />
      </Suspense>
    </div>
  );
};

export default OrganisationPage;
