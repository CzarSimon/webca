import React, { useState } from 'react';
import { Card, Space, Divider } from 'antd';
import { successCallback, SelectedCertificate } from '../../../types';
import { DownloadCertificateButton } from './DownloadCertificateButton';
import { DownloadPrivateKeyButton } from './DownloadPrivateKeyButton';
import { BasicCertificateDetails } from './BasicCertificateDetails';
import { CertificateSubjectDetails } from './CertificateSubjectDetails';
import { CertificateBody } from './CertificateBody';
import { PrivateKeyModal } from './PrivateKeyModal';

import styles from './CertificateDisplay.module.css';

interface Props {
  isAdmin: boolean;
  isLoading: boolean;
  selected: SelectedCertificate;
  downloadCertificate: () => void;
  downloadPrivateKey: (password: string, callback: successCallback) => void;
}

export function CertificateDisplay({ isAdmin, isLoading, selected, downloadCertificate, downloadPrivateKey }: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { certificate } = selected;

  return (
    <div className={styles.Container}>
      <h1 className={styles.CertificateTitle}>{certificate?.name}</h1>
      <Divider />
      <div className={styles.Card}>
        <Card loading={isLoading} bordered={false}>
          <BasicCertificateDetails selected={selected} />
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
