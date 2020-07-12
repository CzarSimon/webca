import React from 'react';
import { Tag, Descriptions } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Certificate } from '../../../types';
import { useFormatedMessage } from '../../../translations';
import { DateTime } from '../../../components/display/DateTime';

interface Props {
  certificate?: Certificate;
}

export function BasicCertificateDetails({ certificate }: Props) {
  const formattedMessage = useFormatedMessage();

  return (
    <Descriptions
      title={
        <h3>
          <FormattedMessage id="basicCertificateDetails.title" />
        </h3>
      }
    >
      <Descriptions.Item label={formattedMessage('basicCertificateDetails.type')}>
        <Tag color="green">
          <FormattedMessage id={`certificate.type-${certificate?.type}`} />
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label={formattedMessage('basicCertificateDetails.createdAt')}>
        <DateTime value={certificate?.createdAt} />
      </Descriptions.Item>
      <Descriptions.Item label={formattedMessage('basicCertificateDetails.expiresAt')}>
        <DateTime value={certificate?.expiresAt} />
      </Descriptions.Item>
    </Descriptions>
  );
}
