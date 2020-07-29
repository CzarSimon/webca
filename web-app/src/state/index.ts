import { applyMiddleware, createStore, combineReducers, compose, AnyAction } from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';
import error from './error';
import certificates from './certificates';
import user from './user';
import { getClientInfo, initLogAndHttpclient } from './initState';
import log from '@czarsimon/remotelogger';

const reducer = combineReducers({
  error,
  certificates,
  user,
});

export type AppState = ReturnType<typeof reducer>;
export type Thunk<T> = ThunkAction<T, AppState, void, AnyAction>;

export function initStore() {
  return createStore(reducer, compose(applyMiddleware(thunk)));
}

export const store = initStore();

export function initState() {
  const client = getClientInfo();
  initLogAndHttpclient(client);
  log.info('initialized application state');
}

export function teardown() {
  log.info('closed down application');
}
