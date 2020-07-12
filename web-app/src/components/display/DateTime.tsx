import React from 'react';
import { FormattedDate } from 'react-intl';

interface Props {
  value?: string | Date;
}

export function DateTime({ value }: Props) {
  if (!value) {
    return null;
  }

  return (
    <FormattedDate
      value={value}
      year="numeric"
      month="2-digit"
      day="numeric"
      hour="numeric"
      minute="numeric"
      second="numeric"
    />
  );
}
