import { format } from 'date-fns';
import {
  LucideArrowLeftRight,
  LucideArrowUpRightFromSquare,
  LucidePencil,
} from 'lucide-react';
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
import { getOrganisationsByUserId } from '../queries/get-organisations-by-user';
import { OrganisationDeleteButton } from './organisation-delete-button';
import { OrganisationSwitchButton } from './organisation-switch-button';

type OrganisationListProps = {
  limitedAccess?: boolean;
};

export const OrganisationList = async ({ limitedAccess }: OrganisationListProps) => {
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
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {organisations.map((organisation) => {
          const isActive = organisation.membershipByUser.isActive;

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
            <Button variant='outline' size='icon'>
              <LucideArrowUpRightFromSquare className='size-4' />
            </Button>
          );
          const editButton = (
            <Button variant='outline' size='icon'>
              <LucidePencil className='size-4' />
            </Button>
          );

          const deleteButton = (
            <OrganisationDeleteButton organisationId={organisation.id} />
          );
          const buttons = (
            <>
              {switchButton}
              {limitedAccess ? null : detailButton}
              {limitedAccess ? null : editButton}
              {limitedAccess ? null : deleteButton}
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
