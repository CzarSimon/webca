import { TypedMap } from '../types';

export const DEV_MODE = true;
export const TIMEOUT_MS = 5000;
export const RETRY_DELAY_MS = 500;

export const CLIENT_ID_KEY = '@webca:web-app:CLIENT_ID';
export const USER_ID_KEY = '@webca:web-app:USER_ID';
export const AUTH_TOKEN_KEY = '@webca:web-app:AUTH_TOKEN';

export const APP_NAME = 'WEBCA_WEB_APP';
export const APP_VERSION = 'x.y.z';

export const PASSWORD_MIN_LENGTH = 16;

export const CERTIFICATE_TYPES: TypedMap<string> = {
  ROOT_CA: 'ROOT_CA',
  INTERMEDIATE_CA: 'INTERMEDIATE_CA',
  CERTIFICATE: 'CERTIFICATE',
};

export const ALGORITHMS: TypedMap<string> = {
  RSA: 'RSA',
};

export const ROLES: TypedMap<string> = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const ERROR_DISPLAY_TIME_MS = 4500;
