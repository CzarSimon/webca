import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Form, Input, Button } from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useFormatedMessage } from '../../../translations';
import { AuthenticationRequest } from '../../../types';
import log from '@czarsimon/remotelogger';

import styles from './Login.module.css';

interface Props {
  submit: (req: AuthenticationRequest) => void;
}

export function Login({ submit }: Props) {
  const formatedMessage = useFormatedMessage();

  const onFinish = ({ accountName, email, password }: Store) => {
    submit({ accountName, email, password });
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Login input failed. Error:${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.Login}>
      <h1 className={styles.LoginTitle}>
        <FormattedMessage id="login.title" />
      </h1>
      <Form initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          name="accountName"
          rules={[{ required: true, message: formatedMessage('login.accountName-required') }]}
        >
          <Input size="large" placeholder={formatedMessage('login.accountName-placeholder')} autoFocus />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              type: 'email',
              message: formatedMessage('login.email-required'),
            },
          ]}
        >
          <Input size="large" placeholder={formatedMessage('login.email-placeholder')} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formatedMessage('login.password-required'),
            },
          ]}
        >
          <Input.Password size="large" placeholder={formatedMessage('login.password-placeholder')} />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            <FormattedMessage id="login.button" />
          </Button>
        </Form.Item>
      </Form>
      <Link to="/signup">
        <FormattedMessage id="login.signup-link" />
      </Link>
    </div>
  );
}
