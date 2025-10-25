'use client';

import { useParams, usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { invitationsPath, membershipsPath, organisationsPath } from '@/paths';

export const OrganisationBreadcrumbs = () => {
  // match route segment name: [organisationId]
  const params = useParams<{ organisationId: string }>();
  const pathName = usePathname();

  const title = {
    memberships: 'Memberships' as const,
    invitations: 'Invitations' as const,
  }[pathName.split('/').at(-1) as 'memberships' | 'invitations'];

  return (
    <Breadcrumbs
      breadcrumbs={[
        { title: 'Organizations', href: organisationsPath() },
        {
          title,
          dropdown: [
            {
              title: 'Memberships',
              href: membershipsPath(params.organisationId),
            },
            {
              title: 'Invitations',
              href: invitationsPath(params.organisationId),
            },
          ],
        },
      ]}
    />
  );
};
