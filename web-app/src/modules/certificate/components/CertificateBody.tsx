import React from 'react';
import { Collapse } from 'antd';
import { Certificate } from '../../../types';
import { useFormatedMessage } from '../../../translations';

import styles from './CertificateBody.module.css';

const { Panel } = Collapse;

interface Props {
  certificate?: Certificate;
}

export function CertificateBody({ certificate }: Props) {
  const formattedMessage = useFormatedMessage();
  if (!certificate) {
    return null;
  }

  const lines = certificate.body.split('\n');
  return (
    <Collapse>
      <Panel header={formattedMessage('certificateBody.collapseButton')} key="1">
        {lines.map((line) => (
          <p className={styles.PemLine} key={line}>
            {line}
          </p>
        ))}
      </Panel>
    </Collapse>
  );
}
