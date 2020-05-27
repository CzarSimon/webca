import { createAction } from 'typesafe-actions';
import { Certificate, CertificateOptions, Page } from '../../types';

const ADD_CERTIFICATES = '@webca/certificates/ADD';
const REMOVE_CERTIFICATES = '@webca/certificates/REMOVE';
const SELECT_CERTIFICATE = '@webca/certificates/SELECT';
const ADD_OPTIONS = '@webca/certificates/ADD_OPTIONS';
const REMOVE_OPTIONS = '@webca/certificates/REMOVE_OPTIONS';

export const addCertificates = createAction(ADD_CERTIFICATES)<Page<Certificate>>();
export const removeCertificates = createAction(REMOVE_CERTIFICATES)<void>();
export const selectCertificate = createAction(SELECT_CERTIFICATE)<Certificate>();
export const addOptions = createAction(ADD_OPTIONS)<CertificateOptions>();
export const removeOptions = createAction(REMOVE_OPTIONS)<void>();
