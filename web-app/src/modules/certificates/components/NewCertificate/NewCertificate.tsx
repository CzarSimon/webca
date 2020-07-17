import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { CertificateOptions, CertificateRequest, Optional, Signatory } from '../../../../types';
import { Dropdown } from '../../../../components/from';
import { FormattedMessage } from 'react-intl';
import { PASSWORD_MIN_LENGTH, CERTIFICATE_TYPES } from '../../../../constants';
import { Store } from 'antd/lib/form/interface';
import log from '@czarsimon/remotelogger';
import { suggestKeySize } from '../../../../utils/rsautil';
import { useFormSelect } from '../../../../state/hooks';
import { useFormatedMessage } from '../../../../translations';
import { AlgorithmOptions } from './AlgorithmOptions';
import { SubjectOptionsForm } from './SubjectOptionsForm';
import { yearsToDays } from '../../../../utils/timeutil';
import { CertificateExpiryForm } from './CertificateExpiryForm';
import { SignatorySearch } from '../SignatorySearch';

import styles from './NewCertificate.module.css';

interface Props {
  options: CertificateOptions;
  submit: (req: CertificateRequest) => void;
}

export function NewCertificate({ options, submit }: Props) {
  const [algorithm, setAlgorithm] = useState<Optional<string>>();
  const [certificateType, setCertificateType] = useState<Optional<string>>();
  const [signatory, setSignatory] = useState<Optional<Signatory>>(undefined);
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

  const onFinish = ({ name, type, algorithm, commonName, password, rsaKeySize, validFor }: Store) => {
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
      signatory,
      expiresInDays: yearsToDays(validFor),
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
          {showSignatorySearch(certificateType) && <SignatorySearch setSignatory={setSignatory} />}
          <AlgorithmOptions
            algorithm={algorithm}
            certificateType={certificateType}
            selectKeySize={onSelect('rsaKeySize')}
          />
          <CertificateExpiryForm validForId="validFor" />
          <SubjectOptionsForm />
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

function showSignatorySearch(certificateType: Optional<string>): boolean {
  const { INTERMEDIATE_CA, CERTIFICATE } = CERTIFICATE_TYPES;
  return certificateType === CERTIFICATE || certificateType === INTERMEDIATE_CA ? true : false;
}
