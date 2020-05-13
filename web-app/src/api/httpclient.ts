import { HttpClient, Fetch } from "@czarsimon/httpclient";
import { Handlers } from "@czarsimon/remotelogger";
import { Client } from '../types';

export let httpclient = new HttpClient({});

export function initHttpclient(client: Client, handlers: Handlers) {
  httpclient = new HttpClient({
    logHandlers: handlers,
    baseHeaders: {
      "X-Client-ID": client.id,
      "X-Session-ID": client.sessionId
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
