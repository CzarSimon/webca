import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Skeleton } from 'antd';

import styles from './NewCertificate.module.css';

export function NewCertificateSkeleton() {
  return (
    <div className={styles.NewCertificate}>
      <h1>
        <FormattedMessage id="newCertificate.title" />
      </h1>
      <Skeleton active />
    </div>
  );
}
