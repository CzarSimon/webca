import log from '@czarsimon/remotelogger';
import { ResponseMetadata } from "@czarsimon/httpclient";
import { Optional } from "../types";

export function logError(messge: string, error: Optional<Error>, metadata: ResponseMetadata) {
  const { requestId, status } = metadata;
  const errorDescription = error ? `error=[${error}]` : `error=[undefined]`;
  log.error(`${messge} Error(${errorDescription}, requestId=${requestId}): Status: ${status}`);
}
