import {
  applyMiddleware,
  createStore,
  combineReducers,
  compose,
  AnyAction
} from "redux";
import thunk, { ThunkAction } from "redux-thunk";
import logger from "redux-logger";
import user from "./user";
import { getClientInfo, initLogAndHttpclient } from "./initState";
import log from "@czarsimon/remotelogger";
import { DEV_MODE } from "../constants";

const reducer = combineReducers({
  user,
});

export type AppState = ReturnType<typeof reducer>;
export type Thunk<T> = ThunkAction<T, AppState, void, AnyAction>;

export const store = createStore(reducer, compose(
  (DEV_MODE) ? applyMiddleware(thunk, logger) : applyMiddleware(thunk)
));

export function initState() {
  const client = getClientInfo();
  initLogAndHttpclient(client);
  log.info("initialized application state");
};

export function teardown() {
  log.info("closed down application");
};
