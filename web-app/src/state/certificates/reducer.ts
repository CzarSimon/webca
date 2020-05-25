import { ActionType, createReducer, PayloadAction, getType } from "typesafe-actions";
import { CertificateState, Certificate, CertificateOptions, Page } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const initalState: CertificateState = {
  certificates: {
    items: undefined,
    loaded: false,
  },
  selected: undefined,
  options: undefined,
};

const reducer = createReducer<CertificateState, CertificateAction>(initalState)
  .handleAction(actions.addCertificates, (state, action) => addCertificates(state, action.payload))
  .handleAction(actions.selectCertificate, (state, action) => selectCertificate(state, action.payload))
  .handleAction(actions.addOptions, (state, action) => addOptions(state, action.payload))
  .handleAction([
    actions.removeCertificates,
    actions.removeOptions
  ], voidReducer);

function addCertificates(state: CertificateState, items: Page<Certificate>): CertificateState {
  return {
    ...state,
    certificates: {
      ...state.certificates,
      loaded: true,
      items,
    }
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

function voidReducer(state: CertificateState, action: PayloadAction<string, void>): CertificateState {
  switch (action.type) {
    case getType(actions.removeCertificates):
      return removeCertificates(state);
    case getType(actions.removeOptions):
      return removeOptions(state);
    default:
      return state;
  }
}

function removeCertificates(state: CertificateState): CertificateState {
  return {
    ...state,
    certificates: {
      ...state.certificates,
      items: undefined,
      loaded: false
    }
  }
};

function removeOptions(state: CertificateState): CertificateState {
  return {
    ...state,
    options: undefined,
  }
};

export default reducer;
