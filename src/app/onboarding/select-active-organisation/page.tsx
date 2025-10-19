import { LucidePlus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { OrganisationList } from '@/features/organisation/components/organisation-list';
import { getOrganisationsByUserId } from '@/features/organisation/queries/get-organisations-by-user';
import { onboardingPath, organisationsPath } from '@/paths';

const SelectActiveOrganisationPage = async () => {
  const organisations = await getOrganisationsByUserId();
  const hasActive = organisations.some(
    (organisation) => organisation.membershipByUser.isActive,
  );
  if (hasActive) {
    redirect(organisationsPath());
  }
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Select Organisation'
        description='Pick one organisation you want to work with'
        actions={
          <>
            <Button asChild>
              <Link href={onboardingPath()}>
                <LucidePlus className='size-4' />
                Create Organisation
              </Link>
            </Button>
          </>
        }
      />
      <Suspense fallback={<Spinner />}>
        <OrganisationList limitedAccess/>
      </Suspense>
    </div>
  );
};

export default SelectActiveOrganisationPage;
