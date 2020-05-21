import { ActionType, createReducer } from "typesafe-actions";
import { CertificateState, CertificateOptions } from "../../types";
import * as actions from "./actions";

type CertificateAction = ActionType<typeof actions>;

const opts = {
  types: [
    {
      name: "ROOT_CA",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    },
    {
      name: "INTERMEDIATE_CA",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    },
    {
      name: "CERTIFICATE",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    }
  ],
  algorithms: ["RSA"],
  formats: ["PEM"],
};

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
