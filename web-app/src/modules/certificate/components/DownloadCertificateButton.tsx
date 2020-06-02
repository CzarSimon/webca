import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CERTIFICATE_TYPES } from '../../../constants';

interface Props {
  isLoading: boolean;
  type?: string;
  download: () => void;
}

export function DownloadCertificateButton({ isLoading, type, download }: Props) {
  const textKey =
    type && CERTIFICATE_TYPES.CERTIFICATE === type
      ? 'certificateDisplay.download-certificateChain'
      : 'certificateDisplay.download-certificate';

  return (
    <Button disabled={isLoading || !type} type="primary" size="large" onClick={download}>
      <FormattedMessage id={textKey} />
    </Button>
  );
}
