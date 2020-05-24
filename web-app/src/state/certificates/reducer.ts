import { ActionType, createReducer, getType, PayloadAction } from "typesafe-actions";
import { CertificateState, Certificate, CertificateOptions } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const initalState: CertificateState = {
  certificates: [],
  selected: undefined,
  options: undefined,
};

const reducer = createReducer<CertificateState, CertificateAction>(initalState)
  .handleAction([
    actions.selectCertificate,
    actions.addCertificate
  ], (state, action) => certificateReducer(state, action))
  .handleAction(actions.addOptions, (state, action) => addOptions(state, action.payload))
  .handleAction(actions.removeOptions, (state, _) => removeOptions(state));

function certificateReducer(state: CertificateState = initalState, action: PayloadAction<string, Certificate>): CertificateState {
  switch (action.type) {
    case getType(actions.selectCertificate):
      return selectCertificate(state, action.payload);
    case getType(actions.addCertificate):
      return addCertificate(state, action.payload);
    default:
      return state;
  }
};

function addCertificate(state: CertificateState, cert: Certificate): CertificateState {
  return {
    ...state,
    certificates: [
      ...state.certificates, cert
    ],
  }
};

function selectCertificate(state: CertificateState, selected: Certificate): CertificateState {
  return {
    ...state,
    selected,
  }
};

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
