import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';

import styles from './CertificateListTitle.module.css';

interface Props {
  createNew: () => void;
}

export function CertificateListTitle({ createNew }: Props) {
  return (
    <div className={styles.CertificateListTitle}>
      <h1>
        <FormattedMessage id="certificateList.title" />
      </h1>
      <Button onClick={createNew} type="primary">
        <FormattedMessage id="certificateList.newCertificate-button" />
      </Button>
    </div>
  );
}
