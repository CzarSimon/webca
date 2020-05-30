import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Certificate } from '../../../types';

interface Props {
  loading: boolean;
  certificate?: Certificate;
}

export function CertificateDisplay({ loading, certificate }: Props) {
  return (
    <>
      <Button>
        <FormattedMessage id="certificateDisplay.download-certificate" />
      </Button>
    </>
  );
}
