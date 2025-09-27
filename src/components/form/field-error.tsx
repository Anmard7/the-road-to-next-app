import { ActionState } from './utils/to-action-state';

type FieldErrorProps = {
  actionState: ActionState;
  name: string;
  id?: string;
};
const FieldError = ({ actionState, name, id }: FieldErrorProps) => {
  const message = actionState.fieldErrors[name]?.[0];
  if (!message) return null;
  return <span id={id} className='text-sm text-red-500'>{message}</span>;
};

export { FieldError };
