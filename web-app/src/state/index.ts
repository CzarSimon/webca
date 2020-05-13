import { getClientInfo, initLogAndHttpclient } from "./initState";
import log from "@czarsimon/remotelogger";

export function initState() {
  const client = getClientInfo();
  initLogAndHttpclient(client);
  log.info("initialized application state");
};

export function teardown() {
  log.info("closed down application");
}
