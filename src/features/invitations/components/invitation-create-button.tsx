'use client';

import { useState } from 'react';
import { InvitationCreateDialog } from './invitation-create-dialog';

type InvitationCreateButtonProps = {
  organisationId: string;
};

const InvitationCreateButton = ({
  organisationId,
}: InvitationCreateButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <InvitationCreateDialog
      organisationId={organisationId}
      open={open}
      setOpen={setOpen}
    />
  );
};

export { InvitationCreateButton };
