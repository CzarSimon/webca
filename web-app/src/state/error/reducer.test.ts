import reducer from './reducer';
import { addError, removeError } from './actions';
import { ErrorInfo, ErrorState } from '../../types';

test('error reducer: add and remove error', () => {
  const initalState: ErrorState = {
    error: undefined,
  };

  const err: ErrorInfo = {
    error: new Error('some error'),
    info: 'some error info',
  };

  let state = reducer(initalState, addError(err));
  expect(state.error).toBeDefined();
  expect(state.error!.error.toString()).toBe('Error: some error');
  expect(state.error!.info).toBe('some error info');

  state = reducer(state, removeError());
  expect(state.error).toBeUndefined();
});
