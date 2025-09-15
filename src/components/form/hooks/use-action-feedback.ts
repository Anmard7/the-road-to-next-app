import { useEffect, useRef } from 'react';
import { ActionState } from '../utils/to-action-state';

type OnArgs = {
  actionState: ActionState;
};

type UseActionFeedbackOptions = {
  onSuccess?: (onArgs: OnArgs) => void;
  onError?: (onArgs: OnArgs) => void;
};

const useActionFeedback = (
  actionState: ActionState,
  options: UseActionFeedbackOptions,
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
