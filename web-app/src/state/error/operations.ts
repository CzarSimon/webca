import { Thunk, Dispatch, ErrorInfo } from '../../types';
import { addError } from './actions';
import { getMessage } from '../../translations';
import { ResponseMetadata } from '@czarsimon/httpclient';

export function registerError(key: string, error: Error): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const err = createErrorInfo(key, error);
    dispatch(addError(err));
  };
}

export function registerHTTPError(name: string, { status }: ResponseMetadata, error: Error): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const err = createErrorInfo(`${name}.${status}`, error);
    dispatch(addError(err));
  };
}

function createErrorInfo(key: string, error: Error): ErrorInfo {
  const message = getMessage(key);
  const info = message || key;
  return { info, error };
}
