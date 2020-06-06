import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Typography } from 'antd';
import { Dropdown } from '../../../../components/from';
import { SelectOption } from '../../../../components/from/types';
import { keySizes, suggestKeySize } from '../../../../utils/rsautil';
import { useFormatedMessage } from '../../../../translations';
import { Optional } from '../../../../types';

import styles from './RSAOptions.module.css';

const keySizeOptions: SelectOption[] = keySizes.map((bits) => ({ id: bits.toString(), text: bits.toString() }));

function sufficientKeySize(selected: Optional<string>, suggested: number): boolean {
  return selected ? parseInt(selected) >= suggested : false;
}

interface Props {
  certificateType?: string;
  selectKeySize: (value: string) => void;
}

export function RSAOptions({ certificateType, selectKeySize }: Props) {
  const [keySize, setKeySize] = useState<Optional<string>>();
  const formattedMessage = useFormatedMessage();
  const suggestedKeySize = certificateType ? suggestKeySize(certificateType) : 0;
  const typeName = certificateType ? formattedMessage(`certificate.type-${certificateType}`) : '';

  const onSelectKeySize = (value: string) => {
    setKeySize(value);
    selectKeySize(value);
  };

  return (
    <div>
      <h3 className={styles.Title}>
        <FormattedMessage id="rsaOptions.title" />
      </h3>
      <Form.Item
        name="rsaKeySize"
        label={formattedMessage('rsaOptions.keySize-label')}
        rules={[{ required: true, message: formattedMessage('rsaOptions.keySize-required') }]}
      >
        <Dropdown
          placeholder={formattedMessage('rsaOptions.keySize-placeholder')}
          options={keySizeOptions}
          onSelect={onSelectKeySize}
        />
      </Form.Item>
      {certificateType && !sufficientKeySize(keySize, suggestedKeySize) && (
        <Typography.Text type="warning">
          {`We recommend a key size of ${suggestedKeySize} bits for a ${typeName}`}
        </Typography.Text>
      )}
    </div>
  );
}
