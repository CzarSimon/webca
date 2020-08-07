import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

interface Props {
  isLoading: boolean;
  isAdmin: boolean;
  isRootCA: boolean;
  onClick: () => void;
}

export function DownloadPrivateKeyButton({ isAdmin, isRootCA, isLoading, onClick }: Props) {
  if (isRootCA && !isAdmin) {
    return null;
  }

  return (
    <Button disabled={isLoading} type="primary" size="large" onClick={onClick}>
      <FormattedMessage id="certificateDisplay.download-privateKey" />
    </Button>
  );
}
