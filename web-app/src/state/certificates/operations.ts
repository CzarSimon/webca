import { Thunk, Dispatch, Optional, CertificateRequest, successCallback } from '../../types';
import * as api from '../../api';
import { ResponseMetadata } from '@czarsimon/httpclient';
import { addOptions, selectCertificate, addCertificates } from './actions';
import { logError, downloadAttachment } from '../../utils/apiutil';

type CreateCallback = (success: boolean, id?: string) => void;

export function createCertificate(req: CertificateRequest, callback: CreateCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body: cert, error, metadata } = await api.createCertificate(req);
    if (!cert) {
      handleCreateCertificateError(error, metadata);
      callback(false);
      return;
    }

    dispatch(selectCertificate(cert));
    callback(true, cert.id);
  };
}

export function getCertificate(id: string): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getCertificate(id);
    if (!body) {
      handleGetCertificateError(id, error, metadata);
      return;
    }

    dispatch(selectCertificate(body));
  };
}

export function getCertificatesByAccountId(accountId: string): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getCertificatesByAccountId(accountId);
    if (!body) {
      handleGetCertificatesError(accountId, error, metadata);
      return;
    }

    dispatch(addCertificates(body));
  };
}

export function downloadCertificateBody(id: string): Thunk {
  return async (): Promise<void> => {
    const { body, error, metadata } = await api.downloadCertificateBody(id);
    if (!body) {
      handleDownloadCertificateBodyError(id, error, metadata);
      return;
    }

    downloadAttachment(body);
  };
}

export function downloadCertificatePrivateKey(id: string, password: string, callback: successCallback): Thunk {
  return async (): Promise<void> => {
    const { body, error, metadata } = await api.downloadCertificatePrivateKey(id, password);
    if (!body) {
      handleDownloadCertificatePrivateKeyError(id, error, metadata);
      callback(false);
      return;
    }

    callback(true);
    downloadAttachment(body);
  };
}

export function getCertificateOptions(): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getCertificateOptions();
    if (!body) {
      handleFetchOptionsError(error, metadata);
      return;
    }

    dispatch(addOptions(body));
  };
}

function handleCreateCertificateError(error: Optional<Error>, metadata: ResponseMetadata) {
  logError('Failed create certificate.', error, metadata);
}

function handleGetCertificateError(id: string, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed fetch certificate by id=${id}.`, error, metadata);
}

function handleGetCertificatesError(accountId: string, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed fetch certificates by accountId=${accountId}`, error, metadata);
}

function handleDownloadCertificateBodyError(id: string, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed fetch certificate body by id=${id}`, error, metadata);
}

function handleDownloadCertificatePrivateKeyError(id: string, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed fetch certificate private key by id=${id}`, error, metadata);
}

function handleFetchOptionsError(error: Optional<Error>, metadata: ResponseMetadata) {
  logError('Failed get certificate options.', error, metadata);
}
