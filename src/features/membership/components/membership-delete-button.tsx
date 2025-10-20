'use client';

import { LucideLoaderCircle, LucideLogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { ActionState } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { deleteMembership } from '../actions/delete-membership';
import { revalidateMemberships } from '../actions/revalidate-memberships';

type MembershipDeleteButtonProps = {
  userId: string;
  organisationId: string;
};

const MembershipDeleteButton = ({
  userId,
  organisationId,
}: MembershipDeleteButtonProps) => {
  const [status, setStatus] = useState<ActionState['status']>();

  useEffect(() => {
    if (status === 'SUCCESS') {
      const revalidateMembs = async () => {
        await revalidateMemberships(organisationId);
      };
      revalidateMembs();
      setStatus(undefined);
    }
  }, [status, organisationId]);

  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteMembership.bind(null, {
      userId,
      organisationId,
    }),
    trigger: (isLoading) =>
      isLoading ? (
        <Button variant='destructive' size='icon'>
          <LucideLoaderCircle className='h-4 w-4 animate-spin' />
        </Button>
      ) : (
        <Button variant='destructive' size='icon'>
          <LucideLogOut className='h-4 w-4' />
        </Button>
      ),
    onSuccess: (result) => {
      if (result.status === 'SUCCESS') {
        setStatus('SUCCESS');
      }
    },
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { MembershipDeleteButton };
