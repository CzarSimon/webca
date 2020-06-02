import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

interface Props {
  isLoading: boolean;
  isAdmin: boolean;
  onClick: () => void;
}

export function DownloadPrivateKeyButton({ isAdmin, isLoading, onClick }: Props) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Button disabled={isLoading} type="primary" size="large" onClick={onClick}>
      <FormattedMessage id="certificateDisplay.download-privateKey" />
    </Button>
  );
}
