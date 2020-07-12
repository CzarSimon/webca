import React from 'react';
import { FormattedDate } from 'react-intl';

interface Props {
  datetime?: string | Date;
}

export function DateTime({ datetime }: Props) {
  if (!datetime) {
    return null;
  }

  return (
    <FormattedDate
      value={datetime}
      year="numeric"
      month="2-digit"
      day="numeric"
      hour="numeric"
      minute="numeric"
      second="numeric"
    />
  );
}
