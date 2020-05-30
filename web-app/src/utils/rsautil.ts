import { CERTIFICATE_TYPES } from '../constants';
import log from '@czarsimon/remotelogger';

const baseKeySize = 1024;

export const keySizes = [1, 2, 4, 8].map((n) => n * baseKeySize);

export function suggestKeySize(certificateType: string): number {
  switch (certificateType) {
    case CERTIFICATE_TYPES.ROOT_CA:
      return 8 * baseKeySize;
    case CERTIFICATE_TYPES.INTERMEDIATE_CA:
      return 4 * baseKeySize;
    case CERTIFICATE_TYPES.CERTIFICATE:
      return 2 * baseKeySize;
    default:
      break;
  }

  log.info(`Unexpected certificateType: ${certificateType}. Suggesting RSA key size: ${baseKeySize * 2}`);
  return baseKeySize * 2;
}
