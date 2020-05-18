import { ActionType, createReducer } from "typesafe-actions";
import { CertificateState, CertificateOptions } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const initalState: CertificateState = {
  certificates: [],
  options: undefined,
};

const reducer = createReducer<CertificateState, CertificateAction>(initalState)
  .handleAction(actions.addOptions, (state, action) => addOptions(state, action.payload))
  .handleAction(actions.removeOptions, (state, _) => removeOptions(state));

function addOptions(state: CertificateState, options: CertificateOptions): CertificateState {
  return {
    ...state,
    options,
  }
};

function removeOptions(state: CertificateState): CertificateState {
  return {
    ...state,
    options: undefined,
  }
};

export default reducer;
