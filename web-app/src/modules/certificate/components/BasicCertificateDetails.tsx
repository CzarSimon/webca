import React from 'react';
import { Tag, Descriptions } from 'antd';
import { FormattedMessage } from 'react-intl';
import { SelectedCertificate } from '../../../types';
import { useFormatedMessage } from '../../../translations';
import { DateTime } from '../../../components/display/DateTime';
import { Link } from 'react-router-dom';

interface Props {
  selected: SelectedCertificate;
}

export function BasicCertificateDetails({ selected }: Props) {
  const formattedMessage = useFormatedMessage();
  const { certificate, signatory } = selected;

  return (
    <Descriptions
      column={2}
      title={
        <h3>
          <FormattedMessage id="basicCertificateDetails.title" />
        </h3>
      }
    >
      <Descriptions.Item label={formattedMessage('basicCertificateDetails.serialNumber')}>
        {certificate?.serialNumber}
      </Descriptions.Item>
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
      {signatory && (
        <Descriptions.Item label={formattedMessage('basicCertificateDetails.certificateAuthoriy')}>
          <Link to={`/certificates/${signatory!.id}`}>{signatory!.name}</Link>
        </Descriptions.Item>
      )}
    </Descriptions>
  );
}
