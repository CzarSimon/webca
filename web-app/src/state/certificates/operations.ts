import { Thunk, Dispatch, Optional, CertificateRequest } from "../../types";
import * as api from "../../api";
import { ResponseMetadata } from "@czarsimon/httpclient";
import { addOptions, addCertificate, selectCertificate } from "./actions";
import { logError } from "../../utils/apiutil";

type CreateCallback = (success: boolean, id?: string) => void

export function createCertificate(req: CertificateRequest, callback: CreateCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body: cert, error, metadata } = await api.createCertificate(req);
    if (!cert) {
      handleCreateCertificateError(error, metadata);
      callback(false);
      return;
    }

    dispatch(addCertificate(cert));
    dispatch(selectCertificate(cert));
    callback(true, cert.id);
  };
};

export function getCertificatesOptions(): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getCertificatesOptions();
    if (!body) {
      handleFetchOptionsError(error, metadata);
      return;
    }

    dispatch(addOptions(body));
  };
};

function handleCreateCertificateError(error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed create certificate.`, error, metadata);
};

function handleFetchOptionsError(error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed get certificate options.`, error, metadata);
};
