import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useFormatedMessage } from '../../../translations';
import { Store } from 'antd/lib/form/interface';
import { successCallback } from '../../../types';

import styles from './PrivateKeyModal.module.css';

interface Props {
  visible: boolean;
  onClose: () => void;
  download: (password: string, callback: successCallback) => void;
}

export function PrivateKeyModal({ visible, onClose, download }: Props) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [form] = Form.useForm();
  const formattedMessage = useFormatedMessage();

  const downloadCallback = (success: boolean) => {
    if (success) {
      onClose();
      return;
    }

    setShowError(true);
    setDownloading(false);
  };

  const onFinish = ({ password }: Store) => {
    download(password, downloadCallback);
    setDownloading(true);
  };

  const removeErrorOnTyping = () => {
    if (!showError) return;
    setShowError(false);
  };

  return (
    <Modal
      centered
      confirmLoading={downloading}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          <FormattedMessage id="privateKeyModal.cancel" />
        </Button>,
        <Button key="download" type="primary" onClick={() => form.submit()}>
          <FormattedMessage id="privateKeyModal.download" />
        </Button>,
      ]}
    >
      <h3 className={styles.Title}>
        <FormattedMessage id="privateKeyModal.label" />
      </h3>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formattedMessage('privateKeyModal.password-required'),
            },
          ]}
        >
          <Input.Password
            onChange={removeErrorOnTyping}
            placeholder={formattedMessage('privateKeyModal.password-plassword')}
          />
        </Form.Item>
        {showError && (
          <Typography.Text type="danger">
            <FormattedMessage id="privateKeyModal.wrongPassword" />
          </Typography.Text>
        )}
      </Form>
    </Modal>
  );
}
