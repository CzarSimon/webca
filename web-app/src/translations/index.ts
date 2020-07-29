import { useIntl } from 'react-intl';
import log from '@czarsimon/remotelogger';
import { TypedMap, TextMap, Optional } from '../types';
import { enUS } from './en';

export const messages: TypedMap<TextMap> = {
  'en-US': enUS,
};

export function getLocale(): string {
  return 'en-US';
}

export function getMessage(key: string): Optional<string> {
  const locale = getLocale();
  const localizedMessages = messages[locale];
  if (!localizedMessages) {
    log.error(`No localizedMessages found for locale=${locale}`);
    return undefined;
  }

  const message = localizedMessages[key];
  if (!message) {
    log.error(`No message found key=${key} in locale=${locale}`);
  }

  return message;
}

export function useFormatedMessage(): (id: string) => string {
  const intl = useIntl();

  return (id: string) => intl.formatMessage({ id });
}
