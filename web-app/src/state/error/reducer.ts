import { ActionType, createReducer } from 'typesafe-actions';
import { ErrorState, ErrorInfo } from '../../types';
import * as actions from './actions';

type ErrorAction = ActionType<typeof actions>;

const initalState: ErrorState = {
  error: {
    info: 'Wrong password',
    error: new Error('err'),
  },
};

const reducer = createReducer<ErrorState, ErrorAction>(initalState)
  .handleAction(actions.addError, (state, action) => addError(state, action.payload))
  .handleAction(actions.removeError, (state) => removeError(state));

function addError(state: ErrorState, error: ErrorInfo) {
  return {
    ...state,
    error,
  };
}

function removeError(state: ErrorState) {
  return {
    ...state,
    error: undefined,
  };
}

export default reducer;
