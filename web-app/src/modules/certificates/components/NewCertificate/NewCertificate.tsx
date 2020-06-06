import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { CertificateOptions, CertificateRequest, Optional } from '../../../../types';
import { Dropdown } from '../../../../components/from';
import { FormattedMessage } from 'react-intl';
import { PASSWORD_MIN_LENGTH } from '../../../../constants';
import { Store } from 'antd/lib/form/interface';
import log from '@czarsimon/remotelogger';
import { suggestKeySize } from '../../../../utils/rsautil';
import { useFormSelect } from '../../../../state/hooks';
import { useFormatedMessage } from '../../../../translations';

import styles from './NewCertificate.module.css';
import { AlgorithmOptions } from './AlgorithmOptions';

interface Props {
  options: CertificateOptions;
  submit: (req: CertificateRequest) => void;
}

export function NewCertificate({ options, submit }: Props) {
  const [algorithm, setAlgorithm] = useState<Optional<string>>();
  const [certificateType, setCertificateType] = useState<Optional<string>>();
  const { form, onSelect } = useFormSelect();
  const formatedMessage = useFormatedMessage();

  const typeOptions = options.types.map((t) => ({
    id: t.name,
    text: formatedMessage(`certificate.type-${t.name}`),
  }));

  const algoOptions = options.algorithms.map((a) => ({
    id: a,
    text: formatedMessage(`certificate.algorithm-${a}`),
  }));

  const selectAlgorithm = (value: string) => {
    setAlgorithm(value);
    onSelect('algorithm')(value);
  };

  const selectCertificateType = (value: string) => {
    setCertificateType(value);
    onSelect('type')(value);
  };

  const onFinish = ({ name, type, algorithm, commonName, password, rsaKeySize }: Store) => {
    let keySize = parseInt(rsaKeySize);
    if (isNaN(keySize)) {
      keySize = suggestKeySize(type);
    }

    submit({
      name,
      type,
      algorithm,
      password,
      subject: {
        commonName,
      },
      options: {
        keySize,
      },
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Certificate request input failed. Error: ${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.NewCertificate}>
      <div className={styles.Content}>
        <h1>
          <FormattedMessage id="newCertificate.title" />
        </h1>
        <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item name="name" rules={[{ required: true, message: formatedMessage('newCertificate.name-required') }]}>
            <Input size="large" placeholder={formatedMessage('newCertificate.name-placeholder')} autoFocus />
          </Form.Item>
          <div className={styles.DropdownRow}>
            <Form.Item
              className={styles.Dropdown}
              name="type"
              rules={[{ required: true, message: formatedMessage('newCertificate.type-required') }]}
            >
              <Dropdown
                size="large"
                placeholder={formatedMessage('newCertificate.type-placeholder')}
                options={typeOptions}
                onSelect={selectCertificateType}
              />
            </Form.Item>
            <Form.Item
              className={styles.Dropdown}
              name="algorithm"
              rules={[{ required: true, message: formatedMessage('newCertificate.algorithm-required') }]}
            >
              <Dropdown
                size="large"
                placeholder={formatedMessage('newCertificate.algorithm-placeholder')}
                options={algoOptions}
                onSelect={selectAlgorithm}
              />
            </Form.Item>
          </div>
          <AlgorithmOptions
            algorithm={algorithm}
            certificateType={certificateType}
            selectKeySize={onSelect('rsaKeySize')}
          />
          <h3 className={styles.SubjectTitle}>
            <FormattedMessage id="newCertificate.subject-title" />
          </h3>
          <Form.Item
            name="commonName"
            rules={[{ required: true, message: formatedMessage('newCertificate.subject.commonName-required') }]}
          >
            <Input size="large" placeholder={formatedMessage('newCertificate.subject.commonName-placeholder')} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                min: PASSWORD_MIN_LENGTH,
                message: formatedMessage('newCertificate.password-required'),
              },
            ]}
          >
            <Input.Password size="large" placeholder={formatedMessage('newCertificate.password-placeholder')} />
          </Form.Item>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block>
              <FormattedMessage id="newCertificate.button" />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
