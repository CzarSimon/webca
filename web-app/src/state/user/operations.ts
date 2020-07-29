import {
  Thunk,
  AuthenticationRequest,
  Dispatch,
  Optional,
  successCallback,
  AuthenticationResponse,
  User,
} from '../../types';
import * as api from '../../api';
import { ResponseMetadata } from '@czarsimon/httpclient';
import log from '@czarsimon/remotelogger';
import { setToken } from '../../api/httpclient';
import { addUser, removeUser } from './actions';
import { logError, createApiError } from '../../utils/apiutil';
import { USER_ID_KEY, AUTH_TOKEN_KEY } from '../../constants';
import { registerHTTPError } from '../error';

export function signUp(req: AuthenticationRequest, callback: successCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.signup(req);
    if (!body) {
      handleSignupError(dispatch, req, error, metadata);
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
      handleLoginError(dispatch, req, error, metadata);
      callback(false);
      return;
    }

    log.debug(`Successfully logged in user for account: ${req.accountName}`);
    storeAuthResponse(body);
    dispatch(addUser(body.user));
    callback(true);
  };
}

export function getUser(id: string): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getUser(id);
    if (!body) {
      handleGetUserError(dispatch, id, error, metadata);
      return;
    }

    log.debug(`Successfully retrieved user(id=${id}, accountId=${body.account.id})`);
    dispatch(addUser(body));
  };
}

export function logout(user?: User): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    if (!user) {
      log.error('Failed to log out undefined user');
      return;
    }

    log.info(`Logged out user user(id=${user.id})`);
    setToken('');
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
    dispatch(removeUser());
  };
}

function storeAuthResponse(auth: AuthenticationResponse) {
  const { token, user } = auth;

  setToken(token);
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(USER_ID_KEY, user.id);
}

function handleSignupError(
  dispatch: Dispatch,
  req: AuthenticationRequest,
  error: Optional<Error>,
  metadata: ResponseMetadata,
) {
  logError(`Failed to create user/account. accountName=${req.accountName}`, error, metadata);
  dispatch(registerHTTPError('api.signup', metadata, error || createApiError(metadata)));
}

function handleLoginError(
  dispatch: Dispatch,
  req: AuthenticationRequest,
  error: Optional<Error>,
  metadata: ResponseMetadata,
) {
  logError(`Failed to login user. accountName=${req.accountName}`, error, metadata);
  dispatch(registerHTTPError('api.login', metadata, error || createApiError(metadata)));
}

function handleGetUserError(dispatch: Dispatch, userId: string, error: Optional<Error>, metadata: ResponseMetadata) {
  logError(`Failed to retrieve user(id=${userId}).`, error, metadata);
  dispatch(registerHTTPError('api.getUser', metadata, error || createApiError(metadata)));
}
