import { HTTPResponse } from '@czarsimon/httpclient';
import { httpclient } from './httpclient';
import { StatusBody, TypedMap } from '../types';
import log from '@czarsimon/remotelogger';

export * from './accountApi';
export * from './certificateApi';
export * from './userApi';
export * from './invitationApi';

type HealthCheck = () => Promise<HTTPResponse<StatusBody>>;

const checkApiServer = (): Promise<HTTPResponse<StatusBody>> => httpclient.get<StatusBody>({ url: '/api/health' });

const checkHttplogger = (): Promise<HTTPResponse<StatusBody>> =>
  httpclient.get<StatusBody>({ url: '/api/httplogger/health' });

export async function checkBackendHealth(): Promise<void> {
  const healthChecks: TypedMap<HealthCheck> = {
    'api-server': checkApiServer,
    httplogger: checkHttplogger,
  };

  for (const [service, check] of Object.entries(healthChecks)) {
    checkHealth(service, check);
  }
}

async function checkHealth(service: string, check: HealthCheck) {
  try {
    const { body, metadata } = await check();
    const { status } = metadata;
    if (metadata.status >= 300) {
      log.error(`${service} unhealthy. status=${status}, body=${body}`);
    }

    log.info(`${service} healthy. status=${status}`);
  } catch (error) {
    log.error(`failed to call ${service}. error=${error}`);
  }
}
