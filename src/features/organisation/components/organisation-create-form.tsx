'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from '@/components/form/utils/to-action-state';
import { Input } from '@/components/ui/input';
import { createOrganisation } from '../actions/create-organisation';

type OrganisationNameFieldsProps = {
  actionState: ActionState;
};

const OrganisationNameFields = ({ actionState }: OrganisationNameFieldsProps) => (
  <>
    <Input
      name='name'
      id='organisation-name'
      placeholder='Name'
      defaultValue={actionState.payload?.get('name')?.toString()}
      aria-invalid={Boolean(actionState.fieldErrors.name?.length)}
      aria-describedby='organisation-name-error'
    />
    <FieldError
      actionState={actionState}
      name='name'
      id='organisation-name-error'
    />
  </>
);

const OrganisationCreateForm = () => {
  const [actionState, action] = useActionState(
    createOrganisation,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <OrganisationNameFields actionState={actionState} />
      <SubmitButton label='Create Organisation' />
    </Form>
  );
};

export { OrganisationCreateForm, OrganisationNameFields };
