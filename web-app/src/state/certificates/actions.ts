import { createAction } from 'typesafe-actions';
import { Certificate, CertificateOptions, Page } from '../../types';

const ADD_CERTIFICATES = '@webca/certificates/ADD';
const REMOVE_CERTIFICATES = '@webca/certificates/REMOVE';
const ADD_SIGNING_CERTIFICATES = '@webca/certificates/ADD_SIGNING_CERTIFICATES';
const REMOVE_SIGNING_CERTIFICATES = '@webca/certificates/REMOVE_SIGNING_CERTIFICATES';
const SELECT_CERTIFICATE = '@webca/certificates/SELECT';
const ADD_SELECTED_SIGNATORY = '@webca/certificates/ADD_SELECTED_SIGNATORY';
const DESELECT_CERTIFICATE = '@webca/certificates/DESELECT';
const ADD_OPTIONS = '@webca/certificates/ADD_OPTIONS';
const REMOVE_OPTIONS = '@webca/certificates/REMOVE_OPTIONS';

export const addCertificates = createAction(ADD_CERTIFICATES)<Page<Certificate>>();
export const removeCertificates = createAction(REMOVE_CERTIFICATES)<void>();
export const addSigningCertificates = createAction(ADD_SIGNING_CERTIFICATES)<Certificate[]>();
export const removeSigningCertificates = createAction(REMOVE_SIGNING_CERTIFICATES)<void>();
export const selectCertificate = createAction(SELECT_CERTIFICATE)<Certificate>();
export const addSelectedSignatory = createAction(ADD_SELECTED_SIGNATORY)<Certificate>();
export const deselectCertificate = createAction(DESELECT_CERTIFICATE)<void>();
export const addOptions = createAction(ADD_OPTIONS)<CertificateOptions>();
export const removeOptions = createAction(REMOVE_OPTIONS)<void>();
