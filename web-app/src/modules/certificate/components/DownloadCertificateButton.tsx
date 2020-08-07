import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

interface Props {
  isLoading: boolean;
  fullchain?: boolean;
  onClick: () => void;
}

export function DownloadCertificateButton({ isLoading, onClick, fullchain = false }: Props) {
  const textKey = fullchain
    ? 'certificateDisplay.download-certificateChain'
    : 'certificateDisplay.download-certificate';

  return (
    <Button disabled={isLoading} type="primary" size="large" onClick={onClick}>
      <FormattedMessage id={textKey} />
    </Button>
  );
}
