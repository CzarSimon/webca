import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Form, Input, Button } from 'antd';
import { AuthenticationRequest } from '../../../types';
import { useFormatedMessage } from '../../../translations';
import { Store } from 'antd/lib/form/interface';
import { PASSWORD_MIN_LENGTH } from '../../../constants';
import log from '@czarsimon/remotelogger';

import styles from './SignUp.module.css';

interface Props {
  submit: (req: AuthenticationRequest) => void;
}

export function SignUp({ submit }: Props) {
  const formatedMessage = useFormatedMessage();

  const onFinish = ({ accountName, email, password }: Store) => {
    submit({ accountName, email, password });
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Signup input failed. Error:${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.SignUp}>
      <h1 className={styles.SignFormTitle}>
        <FormattedMessage id="signup.title" />
      </h1>
      <p>Showing tobbe</p>
      <Form initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          name="accountName"
          rules={[{ required: true, message: formatedMessage('signup.accountName-required') }]}
        >
          <Input size="large" placeholder={formatedMessage('signup.accountName-placeholder')} autoFocus />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              type: 'email',
              message: formatedMessage('signup.email-required'),
            },
          ]}
        >
          <Input size="large" placeholder={formatedMessage('signup.email-placeholder')} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              min: PASSWORD_MIN_LENGTH,
              message: formatedMessage('signup.password-required'),
            },
          ]}
        >
          <Input.Password size="large" placeholder={formatedMessage('signup.password-placeholder')} />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            <FormattedMessage id="signup.button" />
          </Button>
        </Form.Item>
      </Form>
      <Link to="/login">
        <FormattedMessage id="signup.login-link" />
      </Link>
    </div>
  );
}
