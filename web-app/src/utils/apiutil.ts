import { saveAs } from 'file-saver';
import log from '@czarsimon/remotelogger';
import { ResponseMetadata } from '@czarsimon/httpclient';
import { Optional, Attachment } from '../types';

export function logError(messge: string, error: Optional<Error>, metadata: ResponseMetadata) {
  const { requestId, status } = metadata;
  const errorDescription = error ? `error=[${error}]` : 'error=[undefined]';
  log.error(`${messge} Error(${errorDescription}, requestId=${requestId}): Status: ${status}`);
}

export function downloadAttachment({ body, filename, contentType }: Attachment) {
  const blob = new Blob([body], { type: contentType });
  saveAs(blob, filename);
  log.info(`successfully downloaded attachment(filename=${filename}, contentType=${contentType})`);
}
