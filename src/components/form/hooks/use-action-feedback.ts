import { useEffect, useRef } from 'react';
import { ActionState } from '../utils/to-action-state';

type OnArgs<T> = {
  actionState: ActionState<T>;
};

type UseActionFeedbackOptions<T> = {
  onSuccess?: (onArgs: OnArgs<T>) => void;
  onError?: (onArgs: OnArgs<T>) => void;
};

const useActionFeedback = <T>(
  actionState: ActionState<T>,
  options: UseActionFeedbackOptions<T>,
) => {
  const prevTimeStamp = useRef(actionState.timestamp);
  const isUpdate = prevTimeStamp.current !== actionState.timestamp;

  useEffect(() => {
    if (!isUpdate) {
      return;
    }
    // Only process if actionState has actually changed
    if (actionState.status === 'SUCCESS') {
      options.onSuccess?.({ actionState });
    }
    if (actionState.status === 'ERROR') {
      options.onError?.({ actionState });
    }
    prevTimeStamp.current = actionState.timestamp;
  }, [actionState, options, isUpdate]);
};

export { useActionFeedback };
