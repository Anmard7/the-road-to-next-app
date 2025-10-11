import * as z from 'zod';

export type ActionState<T = unknown> = {
  status?: 'SUCCESS' | 'ERROR';
  message: string;
  payload?: FormData;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  data?: T;
};

export const EMPTY_ACTION_STATE: ActionState<undefined> = {
  message: '',
  fieldErrors: {},
  timestamp: Date.now(),
};

export const fromErrorToActionState = <T = unknown>(
  error: unknown,
  formData?: FormData,
): ActionState<T> => {
  if (error instanceof z.ZodError) {
    return {
      status: 'ERROR',
      message: '',
      fieldErrors: z.flattenError(error).fieldErrors,
      payload: formData,
      timestamp: Date.now(),
    };
  } else if (error instanceof Error) {
    return {
      status: 'ERROR',
      message: error.message,
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  } else {
    return {
      status: 'ERROR',
      message: 'Unknown error occured',
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  }
};

export const toActionState = <T = unknown>(
  status: ActionState['status'],
  message: string,
  formData?: FormData,
  data?: T,
): ActionState<T> => {
  return {
    status,
    message,
    payload: formData,
    fieldErrors: {},
    timestamp: Date.now(),
    data,
  };
};
