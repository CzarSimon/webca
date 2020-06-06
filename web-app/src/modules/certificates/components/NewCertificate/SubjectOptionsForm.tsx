import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Input } from 'antd';
import { useFormatedMessage } from '../../../../translations';

import styles from './SubjectOptionsForm.module.css';

export function SubjectOptionsForm() {
  const formattedMessage = useFormatedMessage();

  return (
    <>
      <h3 className={styles.Title}>
        <FormattedMessage id="newCertificate.subject-title" />
      </h3>
      <Form.Item
        name="commonName"
        rules={[{ required: true, message: formattedMessage('newCertificate.subject.commonName-required') }]}
      >
        <Input size="large" placeholder={formattedMessage('newCertificate.subject.commonName-placeholder')} />
      </Form.Item>
    </>
  );
}
