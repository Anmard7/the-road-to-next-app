import { format } from 'date-fns';
import { LucideBan, LucideCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getMemberships } from '../queries/get-memberships';
import { MembershipDeleteButton } from './membership-delete-button';
import { MembershipMoreMenu } from './membership-more-menu';
import { PermissionToggle } from './permission-toggle';

type MembershipsListProps = {
  organisationId: string;
  currentUserId: string;
};

export const MembershipsList = async ({
  organisationId,
  currentUserId,
}: MembershipsListProps) => {
  const memberships = await getMemberships(organisationId);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead>Verified Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Can Delete Ticket?</TableHead>
          <TableHead>Can Update Ticket?</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership) => {
          const membershipMoreMenu = (
            <MembershipMoreMenu
              userId={membership.userId}
              organisationId={membership.organisationId}
              membershipRole={membership.membershipRole}
            />
          );

          const deleteButton = (
            <MembershipDeleteButton
              organisationId={organisationId}
              userId={membership.userId}
            />
          );

          const buttons = (
            <>
              {membershipMoreMenu}
              {deleteButton}
            </>
          );

          return (
            <TableRow key={membership.userId}>
              <TableCell>
                {membership.userId === currentUserId ? (
                  <>
                    <span>{membership.user.username}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant='secondary'>(you)</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>That&apos;s you!</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <span>{membership.user.username}</span>
                )}
              </TableCell>
              <TableCell>{membership.user.email}</TableCell>
              <TableCell>
                {format(membership.joinedAt, 'yyyy-MM-dd, HH:mm')}
              </TableCell>
              <TableCell>
                {membership.user.emailVerified ? (
                  <Badge
                    variant='secondary'
                    className='bg-green-500 text-white dark:bg-green-900'
                  >
                    <LucideCheck />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant='secondary'
                    className='bg-red-500 text-white dark:bg-red-900'
                  >
                    <LucideBan />
                    Not Verified
                  </Badge>
                )}
              </TableCell>
              <TableCell>{membership.membershipRole}</TableCell>
              <TableCell>
                <PermissionToggle
                  userId={membership.userId}
                  organisationId={membership.organisationId}
                  permissionKey='canDeleteTicket'
                  permissionValue={membership.canDeleteTicket}
                />
              </TableCell>
              <TableCell>
                <PermissionToggle
                  userId={membership.userId}
                  organisationId={membership.organisationId}
                  permissionKey='canUpdateTicket'
                  permissionValue={membership.canUpdateTicket}
                />
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
