import React from 'react';
import { Card, Space } from 'antd';
import { Certificate } from '../../../types';
import { DownloadCertificateButton } from './DownloadCertificateButton';
import { DownloadPrivateKeyButton } from './DownloadPrivateKeyButton';
import { BasicCertificateDetails } from './BasicCertificateDetails';
import { CertificateSubjectDetails } from './CertificateSubjectDetails';
import { CertificateBody } from './CertificateBody';

import styles from './CertificateDisplay.module.css';

interface Props {
  isAdmin: boolean;
  isLoading: boolean;
  certificate?: Certificate;
}

export function CertificateDisplay({ isAdmin, isLoading, certificate }: Props) {
  return (
    <div className={styles.CertificateDisplay}>
      <div className={styles.Card}>
        <Card title={<h2>{certificate?.name}</h2>} loading={isLoading}>
          <BasicCertificateDetails certificate={certificate} />
          <CertificateSubjectDetails subject={certificate?.subject} />
          <CertificateBody certificate={certificate} />
        </Card>
      </div>
      <div className={styles.ButtonGroup}>
        <Space>
          <DownloadCertificateButton isLoading={isLoading} type={certificate?.type} />
          <DownloadPrivateKeyButton isLoading={isLoading} isAdmin={isAdmin} />
        </Space>
      </div>
    </div>
  );
}
