import { createAction } from 'typesafe-actions';
import { Certificate, CertificateOptions } from "../../types";

const ADD_CERTIFICATE: string = "@webca/certificates/ADD_CERTIFICATE";
const SELECT_CERTIFICATE: string = "@webca/certificates/SELECT";
const ADD_OPTIONS: string = "@webca/certificates/ADD_OPTIONS";
const REMOVE_OPTIONS: string = "@webca/certificates/REMOVE_OPTIONS";

export const addCertificate = createAction(ADD_CERTIFICATE)<Certificate>();
export const selectCertificate = createAction(SELECT_CERTIFICATE)<Certificate>();
export const addOptions = createAction(ADD_OPTIONS)<CertificateOptions>();
export const removeOptions = createAction(REMOVE_OPTIONS)<void>();
