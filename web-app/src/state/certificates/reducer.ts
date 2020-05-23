import { ActionType, createReducer } from "typesafe-actions";
import { CertificateState, Certificate, CertificateOptions } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const initalState: CertificateState = {
  certificates: [],
  selected: undefined,
  options: undefined,
};

const reducer = createReducer<CertificateState, CertificateAction>(initalState)
  .handleAction(actions.selectCertificate, (state, action) => selectCertificate(state, action.payload))
  .handleAction(actions.addCertificate, (state, action) => addCertificate(state, action.payload))
  .handleAction(actions.addOptions, (state, action) => addOptions(state, action.payload))
  .handleAction(actions.removeOptions, (state, _) => removeOptions(state));

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
