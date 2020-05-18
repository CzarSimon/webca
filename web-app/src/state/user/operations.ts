import { Thunk, AuthenticationRequest, Dispatch, Optional, successCallback } from "../../types";
import { signupUser } from "../../api";
import { ResponseMetadata } from "@czarsimon/httpclient";
import log from '@czarsimon/remotelogger';
import { setToken } from "../../api/httpclient";
import { addUser } from "./actions";

export function signUp(req: AuthenticationRequest, callback: successCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await signupUser(req);
    if (!body) {
      handleSignupError(req, error, metadata);
      callback(false);
      return;
    }
    log.debug(`Successfully created new user for account: ${req.accountName}`);
    setToken(body.token);
    dispatch(addUser(body.user));
    callback(true);
  };
};

function handleSignupError(req: AuthenticationRequest, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed to create user/account. accountName=${req.accountName}`, error, metadata);
};

function logError(messge: string, error: Optional<Error>, metadata: ResponseMetadata) {
  const { requestId, status } = metadata;
  const errorDescription = error ? `error=[${error}]` : `error=[undefined]`;
  log.error(`${messge} Error(${errorDescription}, requestId=${requestId}): Status: ${status}`);
}
