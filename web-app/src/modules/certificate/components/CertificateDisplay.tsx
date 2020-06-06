import React, { useState } from 'react';
import { Card, Space, Divider } from 'antd';
import { Certificate, successCallback } from '../../../types';
import { DownloadCertificateButton } from './DownloadCertificateButton';
import { DownloadPrivateKeyButton } from './DownloadPrivateKeyButton';
import { BasicCertificateDetails } from './BasicCertificateDetails';
import { CertificateSubjectDetails } from './CertificateSubjectDetails';
import { CertificateBody } from './CertificateBody';

import styles from './CertificateDisplay.module.css';
import { PrivateKeyModal } from './PrivateKeyModal';

interface Props {
  isAdmin: boolean;
  isLoading: boolean;
  certificate?: Certificate;
  downloadCertificate: () => void;
  downloadPrivateKey: (password: string, callback: successCallback) => void;
}

export function CertificateDisplay({
  isAdmin,
  isLoading,
  certificate,
  downloadCertificate,
  downloadPrivateKey,
}: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className={styles.Container}>
      <h1 className={styles.CertificateTitle}>{certificate?.name}</h1>
      <Divider />
      <div className={styles.Card}>
        <Card loading={isLoading} bordered={false}>
          <BasicCertificateDetails certificate={certificate} />
          <CertificateSubjectDetails subject={certificate?.subject} />
          <CertificateBody certificate={certificate} />
        </Card>
      </div>
      <div className={styles.ButtonGroup}>
        <Space>
          <DownloadCertificateButton isLoading={isLoading} type={certificate?.type} onClick={downloadCertificate} />
          <DownloadPrivateKeyButton isLoading={isLoading} isAdmin={isAdmin} onClick={() => setModalOpen(true)} />
        </Space>
      </div>
      <PrivateKeyModal visible={modalOpen} onClose={() => setModalOpen(false)} download={downloadPrivateKey} />
    </div>
  );
}
