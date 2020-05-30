import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

interface Props {
  isLoading: boolean;
  isAdmin: boolean;
}

export function DownloadPrivateKeyButton({ isAdmin, isLoading }: Props) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Button disabled={isLoading} type="primary" size="large">
      <FormattedMessage id="certificateDisplay.download-privateKey" />
    </Button>
  );
}
