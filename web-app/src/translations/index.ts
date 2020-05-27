import { TypedMap, TextMap } from '../types';
import { enUS } from './en';
import { useIntl } from 'react-intl';

export const messages: TypedMap<TextMap> = {
  'en-US': enUS,
};

export function getLocale(): string {
  return 'en-US';
}

export function useFormatedMessage(): (id: string) => string {
  const intl = useIntl();

  return (id: string) => intl.formatMessage({ id });
}
