import { Thunk, Dispatch, Optional } from "../../types";
import * as api from "../../api";
import { ResponseMetadata } from "@czarsimon/httpclient";
import log from '@czarsimon/remotelogger';
import { addOptions } from "./actions";

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

function handleFetchOptionsError(error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed get certificate options.`, error, metadata);
};

function logError(messge: string, error: Optional<Error>, metadata: ResponseMetadata) {
  const { requestId, status } = metadata;
  const errorDescription = error ? `error=[${error}]` : `error=[undefined]`;
  log.error(`${messge} Error(${errorDescription}, requestId=${requestId}): Status: ${status}`);
}
