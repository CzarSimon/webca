import { CERTIFICATE_TYPES } from "../constants";
import log from '@czarsimon/remotelogger';


export function suggestKeySize(certificateType: string): number {
  const defaultKeySize = 2048;
  switch (certificateType) {
    case CERTIFICATE_TYPES.ROOT:
      return 4 * defaultKeySize;
    case CERTIFICATE_TYPES.INTERMEDIATE:
      return 2 * defaultKeySize;
    case CERTIFICATE_TYPES.USER_CERTIFICATE:
      return 1 * defaultKeySize;
    default:
      break;
  }

  log.info(`Unexpected certificateType: ${certificateType}. Suggesting RSA key size: ${defaultKeySize}`);
  return defaultKeySize;
}
