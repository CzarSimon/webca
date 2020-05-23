import { TypedMap } from "../types";

export const DEV_MODE: boolean = true;
export const TIMEOUT_MS: number = 5000;
export const RETRY_DELAY_MS: number = 500;

export const CLIENT_ID_KEY: string = "@webca:web-app:CLIENT_ID";
export const USER_ID_KEY: string = "@webca:web-app:USER_ID";
export const AUTH_TOKEN_KEY: string = "@webca:web-app:AUTH_TOKEN";

export const APP_NAME: string = "WEBCA_WEB_APP";
export const APP_VERSION: string = "x.y.z";

export const PASSWORD_MIN_LENGTH: number = 16;

export const CERTIFICATE_TYPES: TypedMap<string> = {
  ROOT: "ROOT_CA",
  INTERMEDIATE: "INTERMEDIATE_CA",
  USER_CERTIFICATE: "CERTIFICATE",
};
