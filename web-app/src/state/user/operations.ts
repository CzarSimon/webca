import { Thunk, AuthenticationRequest, Dispatch, Optional, successCallback, AuthenticationResponse } from '../../types';
import * as api from '../../api';
import { ResponseMetadata } from '@czarsimon/httpclient';
import log from '@czarsimon/remotelogger';
import { setToken } from '../../api/httpclient';
import { addUser } from './actions';
import { logError } from '../../utils/apiutil';
import { USER_ID_KEY, AUTH_TOKEN_KEY } from '../../constants';

export function signUp(req: AuthenticationRequest, callback: successCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.signup(req);
    if (!body) {
      handleSignupError(req, error, metadata);
      callback(false);
      return;
    }

    log.debug(`Successfully created new user for account: ${req.accountName}`);
    storeAuthResponse(body);
    dispatch(addUser(body.user));
    callback(true);
  };
}

export function login(req: AuthenticationRequest, callback: successCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.login(req);
    if (!body) {
      handleLoginError(req, error, metadata);
      callback(false);
      return;
    }

    log.debug(`Successfully created new user for account: ${req.accountName}`);
    storeAuthResponse(body);
    dispatch(addUser(body.user));
    callback(true);
  };
}

function storeAuthResponse(auth: AuthenticationResponse) {
  const { token, user } = auth;

  setToken(token);
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(USER_ID_KEY, user.id);
}

function handleSignupError(req: AuthenticationRequest, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed to create user/account. accountName=${req.accountName}`, error, metadata);
}

function handleLoginError(req: AuthenticationRequest, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed to login user. accountName=${req.accountName}`, error, metadata);
}
