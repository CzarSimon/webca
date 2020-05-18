import { createAction } from 'typesafe-actions';
import { CertificateOptions } from "../../types";

const ADD_OPTIONS: string = "@webca/certificates/ADD_OPTIONS";

export const addOptions = createAction(ADD_OPTIONS)<CertificateOptions>();
