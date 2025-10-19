'use client';

import { LucideLoaderCircle, LucideTrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { ActionState } from '@/components/form/utils/to-action-state';
import { Button } from '@/components/ui/button';
import { deleteOrganisation } from '../actions/delete-oraganisation';
import { revalidateOrganizations } from '../actions/revalidate-organizations';

type OrganisationDeleteButtonProps = {
  organisationId: string;
};
export const OrganisationDeleteButton = ({
  organisationId,
}: OrganisationDeleteButtonProps) => {
  const [status, setStatus] = useState<ActionState['status']>();

  useEffect(() => {
    if (status === 'SUCCESS') {
      const revalidateOrgs = async () => {
        await revalidateOrganizations();
      };
      revalidateOrgs();
      setStatus(undefined);
    }
  }, [status]);
  const [deleteDialog, deleteButton] = useConfirmDialog({
    action: deleteOrganisation.bind(null, organisationId),
    trigger: (isPending) => (
      <Button variant='destructive' size='icon' disabled={isPending}>
        {isPending ? (
          <LucideLoaderCircle className='size-4 animate-spin' />
        ) : (
          <LucideTrash className='size-4' />
        )}
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
