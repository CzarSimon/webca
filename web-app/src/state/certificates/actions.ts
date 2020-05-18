import { createAction } from 'typesafe-actions';
import { CertificateOptions } from "../../types";

const ADD_OPTIONS: string = "@webca/certificates/ADD_OPTIONS";
const REMOVE_OPTIONS: string = "@webca/certificates/REMOVE_OPTIONS";

export const addOptions = createAction(ADD_OPTIONS)<CertificateOptions>();
export const removeOptions = createAction(REMOVE_OPTIONS)<void>();
