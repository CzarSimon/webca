import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { useFormatedMessage } from '../../../../translations';

interface Props {
  validForId: string;
}

export function CertificateExpiryForm({ validForId }: Props) {
  const formattedMessage = useFormatedMessage();
  const [value, setValue] = useState<number>(1);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const int = parseInt(val);
    if (!isNaN(int)) {
      setValue(int);
    }
  };

  const suffixKey =
    value === 1 ? 'certificateExpiry.validFor-timeUnit-singular' : 'certificateExpiry.validFor-timeUnit-plural';

  return (
    <Form.Item
      name={validForId}
      label={formattedMessage('certificateExpiry.validFor-label')}
      initialValue={value}
      rules={[{ required: true, min: 1, message: formattedMessage('certificateExpiry.validFor-required') }]}
    >
      <Input type="number" suffix={formattedMessage(suffixKey)} min={1} onChange={onChange} value={value} />
    </Form.Item>
  );
}
