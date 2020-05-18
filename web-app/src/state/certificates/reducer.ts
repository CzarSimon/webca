import { ActionType, createReducer } from "typesafe-actions";
import { CertificateState, CertificateOptions } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const initalState: CertificateState = {
  certificates: [],
  options: undefined,
};

const reducer = createReducer<CertificateState, CertificateAction>(initalState)
  .handleAction(actions.addOptions, (state, action) => addOptions(state, action.payload));

function addOptions(state: CertificateState, options: CertificateOptions): CertificateState {
  return {
    ...state,
    options,
  }
};

export default reducer;
