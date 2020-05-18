import { HttpClient, Fetch, MockTransport, HTTPResponse } from "@czarsimon/httpclient";
import { ConsoleHandler, Handlers, level } from "@czarsimon/remotelogger";
import { Client, TypedMap } from '../types';

export let httpclient = new HttpClient({});

export function initHttpclient(client: Client, handlers: Handlers) {
  httpclient = new HttpClient({
    logHandlers: handlers,
    baseHeaders: {
      "X-Client-ID": client.id,
      "X-Session-ID": client.sessionId,
      "Content-Type": "application/json",
    },
    transport: new Fetch(),
  });
}

export function setToken(token: string) {
  setHeader('Authorization', `Bearer ${token}`);
}

export function setHeader(name: string, value: string) {
  const headers = httpclient.getHeaders();
  httpclient.setHeaders({
    ...headers,
    [name]: value,
  })
}

type MockResponses = TypedMap<HTTPResponse<any>>;

export function mockRequests(resonses: MockResponses) {
  httpclient = new HttpClient({
    logHandlers: { console: new ConsoleHandler(level.DEBUG) },
    transport: new MockTransport(resonses),
  });
}
