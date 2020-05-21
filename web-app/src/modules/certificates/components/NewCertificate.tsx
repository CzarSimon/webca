import React from 'react';
import { FormattedMessage } from 'react-intl';
import log from '@czarsimon/remotelogger';
import { Store } from 'antd/lib/form/interface';
import { Form, Input, Button } from 'antd';
import { useFormatedMessage } from '../../../translations';
import { useFormSelect } from '../../../state/hooks';
import { Dropdown } from '../../../components/from';
import { CertificateOptions, CertificateRequest } from '../../../types';
import { PASSWORD_MIN_LENGTH } from '../../../constants';

import styles from './NewCertificate.module.css';

interface Props {
  options: CertificateOptions;
  submit: (req: CertificateRequest) => void;
}

export function NewCertificate({ options }: Props) {
  const { form, onSelect } = useFormSelect();
  const formatedMessage = useFormatedMessage();

  const typeOptions = options.types.map(t => ({
    id: t.name,
    text: formatedMessage(`certificate.type-${t.name}`),
  }));

  const algoOptions = options.algorithms.map(a => ({
    id: a,
    text: formatedMessage(`certificate.algorithm-${a}`),
  }));

  const onFinish = (res: Store) => {
    log.info(JSON.stringify(res));
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Signup failed. Error: ${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.NewCertificate}>
      <h1>
        <FormattedMessage id="newCertificate.title" />
      </h1>
      <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: formatedMessage("newCertificate.name-required") }]}
        >
          <Input size="large" placeholder={formatedMessage("newCertificate.name-placeholder")} />
        </Form.Item>
        <div className={styles.DropdownRow}>
          <Form.Item
            className={styles.Dropdown}
            name="type"
            rules={[{ required: true, message: formatedMessage("newCertificate.type-required") }]}
          >
            <Dropdown
              size="large"
              placeholder={formatedMessage("newCertificate.type-placeholder")}
              options={typeOptions}
              onSelect={onSelect("type")}
            />
          </Form.Item>
          <Form.Item
            className={styles.Dropdown}
            name="algorithm"
            rules={[{ required: true, message: formatedMessage("newCertificate.algorithm-required") }]}
          >
            <Dropdown
              size="large"
              placeholder={formatedMessage("newCertificate.algorithm-placeholder")}
              options={algoOptions}
              onSelect={onSelect("algorithm")}
            />
          </Form.Item>
        </div>
        <h3 className={styles.SubjectTitle}>
          <FormattedMessage id="newCertificate.subject-title" />
        </h3>
        <Form.Item
          name="commonName"
          rules={[{ required: true, message: formatedMessage("newCertificate.subject.commonName-required") }]}
        >
          <Input size="large" placeholder={formatedMessage("newCertificate.subject.commonName-placeholder")} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{
            required: true,
            min: PASSWORD_MIN_LENGTH,
            message: formatedMessage("newCertificate.password-required")
          }]}
        >
          <Input.Password size="large" placeholder={formatedMessage("newCertificate.password-placeholder")} />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            <FormattedMessage id="newCertificate.button" />
          </Button>
        </Form.Item>
      </Form>
    </div >
  );
}
