import { Suspense } from 'react';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { MembershipsList } from '@/features/membership/components/membership-list';
type MembershipsPageProps = {
  params: Promise<{ organisationId: string }>;
};

const MembershipsPage = async ({ params }: MembershipsPageProps) => {
  const { organisationId } = await params;
  const { user } = await getAuthOrRedirect();
  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Memberships'
        description='Manage members of your organisation'
      />
      <Suspense fallback={<Spinner />}>
        <MembershipsList organisationId={organisationId} currentUserId={user.id} />
      </Suspense>
    </div>
  );
};

export default MembershipsPage;
