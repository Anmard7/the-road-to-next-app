'use client';

import { LucideLoaderCircle, LucideTrash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { deleteInvitation } from '../actions/delete-invitation';

type InvitationDeleteButtonProps = {
  email: string;
  organisationId: string;
};

const InvitationDeleteButton = ({
  email,
  organisationId,
}: InvitationDeleteButtonProps) => {
  const router = useRouter();
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: `Delete invitation for ${email}?`,
    description: 'This will revoke the pending invitation.',
    action: () => deleteInvitation({ email, organisationId }),
    trigger: (isPending) =>
      isPending ? (
        <Button
          variant='destructive'
          size='icon'
          aria-label='Deleting invitation'
          title='Deleting invitation'
        >
          <LucideLoaderCircle className='h-4 w-4 animate-spin' />
        </Button>
      ) : (
        <Button
          variant='destructive'
          size='icon'
          aria-label={`Delete invitation for ${email}`}
          title={`Delete invitation for ${email}`}
        >
          <LucideTrash className='h-4 w-4' />
        </Button>
      ),
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { InvitationDeleteButton };
