import { Suspense } from 'react';
import { Heading } from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { InvitationCreateButton } from '@/features/invitations/components/invitation-create-button';
import { InvitationList } from '@/features/invitations/components/invitation-list';
import { OrganisationBreadcrumbs } from '../_navigation/tabs';

type InvitationsPageProps = {
  params: Promise<{
    organisationId: string;
  }>;
};

const InvitationsPage = async ({ params }: InvitationsPageProps) => {
  const { organisationId } = await params;

  return (
    <div className='flex flex-1 flex-col gap-y-8'>
      <Heading
        title='Invitations'
        description="Manages your organization's invitations"
        tabs={<OrganisationBreadcrumbs />}
        actions={<InvitationCreateButton organisationId={organisationId} />}
      />

      <Suspense fallback={<Spinner />}>
        <InvitationList organisationId={organisationId} />
      </Suspense>
    </div>
  );
};

export default InvitationsPage;
