import { ActionType, createReducer } from 'typesafe-actions';
import { UserState, User } from '../../types';
import * as actions from './actions';

type UserAction = ActionType<typeof actions>;

const initalState: UserState = {
  user: undefined,
  loaded: false,
};

const reducer = createReducer<UserState, UserAction>(initalState)
  .handleAction(actions.addUser, (state, action) => addUser(state, action.payload))
  .handleAction(actions.removeUser, (state) => removeUser(state));

function addUser(state: UserState, user: User): UserState {
  return {
    ...state,
    user: user,
    loaded: true,
  };
}

function removeUser(state: UserState): UserState {
  return {
    ...state,
    user: undefined,
    loaded: false,
  };
}

export default reducer;
