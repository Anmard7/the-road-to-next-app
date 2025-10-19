'use client';
import { useActionState } from 'react';
import { Form } from '@/components/form/form';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { switchOrganisation } from '../actions/switch-organisation';

type OrganisationSwitchButtonProps = {
  organisationId: string;
  trigger: React.ReactNode;
};
const OrganisationSwitchButton = ({
  organisationId,
  trigger,
}: OrganisationSwitchButtonProps) => {
  const [actionState, action] = useActionState(
    switchOrganisation.bind(null, organisationId),
    EMPTY_ACTION_STATE,
  );
  return (
    <Form action={action} actionState={actionState}>
      {trigger}
    </Form>
  );
};

export { OrganisationSwitchButton };
