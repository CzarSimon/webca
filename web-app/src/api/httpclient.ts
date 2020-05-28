import { HttpClient, Fetch, MockTransport, HTTPResponse } from '@czarsimon/httpclient';
import { ConsoleHandler, Handlers, level } from '@czarsimon/remotelogger';
import { Client, TypedMap } from '../types';

export let httpclient = new HttpClient({
  baseHeaders: {
    'Content-Type': 'application/json',
  },
});

export function initHttpclient(client: Client, handlers: Handlers) {
  httpclient = new HttpClient({
    logHandlers: handlers,
    baseHeaders: {
      ...httpclient.getHeaders(),
      'X-Client-ID': client.id,
      'X-Session-ID': client.sessionId,
    },
    transport: new Fetch(),
  });
}

export function setToken(token: string) {
  setHeader('Authorization', `Bearer ${token}`);
}

export function setHeader(name: string, value: string) {
  httpclient.setHeaders({
    ...httpclient.getHeaders(),
    [name]: value,
  });
}

type MockResponses = TypedMap<HTTPResponse<any>>;

export function mockRequests(resonses: MockResponses) {
  httpclient = new HttpClient({
    logHandlers: { console: new ConsoleHandler(level.DEBUG) },
    transport: new MockTransport(resonses),
  });
}
