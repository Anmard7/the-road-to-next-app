import { format } from 'date-fns';
import {
  LucideArrowLeftRight,
  LucideArrowUpRightFromSquare,
  LucidePencil,
} from 'lucide-react';
import Link from 'next/link';
import { SubmitButton } from '@/components/form/submit-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MembershipDeleteButton } from '@/features/membership/components/membership-delete-button';
import { membershipsPath } from '@/paths';
import { getOrganisationsByUserId } from '../queries/get-organisations-by-user';
import { OrganisationDeleteButton } from './organisation-delete-button';
import { OrganisationSwitchButton } from './organisation-switch-button';

type OrganisationListProps = {
  limitedAccess?: boolean;
};

export const OrganisationList = async ({
  limitedAccess,
}: OrganisationListProps) => {
  const organisations = await getOrganisationsByUserId();

  const hasActive = organisations.some(
    (organisation) => organisation.membershipByUser.isActive,
  );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>My Role</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {organisations.map((organisation) => {
          const isActive = organisation.membershipByUser.isActive;
          const isAdmin =
            organisation.membershipByUser.membershipRole === 'ADMIN';

          const switchButton = (
            <OrganisationSwitchButton
              organisationId={organisation.id}
              trigger={
                <SubmitButton
                  icon={<LucideArrowLeftRight />}
                  label={
                    !hasActive ? 'Activate' : isActive ? 'Active' : 'Switch'
                  }
                  variant={
                    !hasActive ? 'secondary' : isActive ? 'default' : 'outline'
                  }
                />
              }
            />
          );

          const detailButton = (
            <Button variant='outline' size='icon' asChild>
              <Link href={membershipsPath(organisation.id)}>
                <LucideArrowUpRightFromSquare className='size-4' />
              </Link>
            </Button>
          );
          const editButton = (
            <Button variant='outline' size='icon'>
              <LucidePencil className='size-4' />
            </Button>
          );
          const leaveButton = (
            <MembershipDeleteButton
              organisationId={organisation.id}
              userId={organisation.membershipByUser.userId}
            />
          );
          const deleteButton = (
            <OrganisationDeleteButton organisationId={organisation.id} />
          );

          const placeholder = (
            <Button size='icon' disabled className='disabled:opacity-0' />
          );
          const buttons = (
            <>
              {switchButton}
              {limitedAccess ? null : isAdmin ? detailButton : placeholder}
              {limitedAccess ? null : isAdmin ? editButton : placeholder}
              {limitedAccess ? null : leaveButton}
              {limitedAccess ? null : isAdmin ? deleteButton : placeholder}
            </>
          );
          return (
            <TableRow key={organisation.id}>
              <TableCell>{organisation.id}</TableCell>
              <TableCell>{organisation.name}</TableCell>
              <TableCell>
                {format(
                  organisation.membershipByUser.joinedAt,
                  'yyyy-MM-dd, HH:mm',
                )}
              </TableCell>
              <TableCell>{organisation._count.memberships}</TableCell>
              <TableCell>
                {organisation.membershipByUser.membershipRole}
              </TableCell>
              <TableCell className='flex justify-end gap-x-2'>
                {buttons}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
