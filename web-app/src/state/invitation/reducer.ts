import { ActionType, createReducer } from 'typesafe-actions';
import { InvitationState, Invitation } from '../../types';
import * as actions from './actions';

type InvitationAction = ActionType<typeof actions>;

const initalState: InvitationState = {
  invitation: undefined,
  loaded: false,
};

const reducer = createReducer<InvitationState, InvitationAction>(initalState).handleAction(
  actions.addInvitation,
  (state, action) => addInvitation(state, action.payload),
);

function addInvitation(state: InvitationState, invitation: Invitation): InvitationState {
  return {
    ...state,
    invitation: invitation,
    loaded: true,
  };
}

export default reducer;
