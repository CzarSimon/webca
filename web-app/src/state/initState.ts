import { v4 as uuid } from 'uuid';
import { Client } from '../types';
import { CLIENT_ID_KEY, DEV_MODE, APP_NAME, APP_VERSION } from '../constants';
import log, { ConsoleHandler, HttploggerHandler, level } from '@czarsimon/remotelogger';
import { initHttpclient } from '../api/httpclient';

export function initLogAndHttpclient(client: Client) {
  const consoleLevel = DEV_MODE ? level.DEBUG : level.ERROR;
  const httpLevel = DEV_MODE ? level.DEBUG : level.INFO;
  const handlers = {
    console: new ConsoleHandler(consoleLevel),
    httplogger: new HttploggerHandler(httpLevel, {
      url: '/api/httplogger/v1/logs',
      app: APP_NAME,
      version: APP_VERSION,
      sessionId: client.sessionId,
      clientId: client.id,
    }),
  };

  initHttpclient(client, handlers);
  log.configure(handlers);
  log.debug('initiated remotelogger');
  log.debug('initiated httpclient');
}

export function getClientInfo(): Client {
  return {
    id: getOrCreateId(CLIENT_ID_KEY),
    sessionId: uuid(),
  };
}

function getOrCreateId(key: string): string {
  const id = localStorage.getItem(key);
  if (id) {
    return id;
  }

  const newId = uuid();
  localStorage.setItem(key, newId);
  return newId;
}
