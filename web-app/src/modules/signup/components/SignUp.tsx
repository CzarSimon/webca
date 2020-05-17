import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Input, Button } from 'antd';
import { AuthenticationRequest } from '../../../types';
import { useFormatedMessage } from '../../../translations';
import { Store } from 'antd/lib/form/interface';
import { PASSWORD_MIN_LENGTH } from '../../../constants';
import log from '@czarsimon/remotelogger';

import styles from './SignUp.module.css';

interface Props {
  submit: (req: AuthenticationRequest) => void
}

export function SignUp(props: Props) {
  const formatedMessage = useFormatedMessage();

  const onFinish = ({ accountName, email, password }: Store) => {
    props.submit({ accountName, email, password });
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Signup failed. Error:${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.SignUp}>
      <h1 className={styles.SignFormTitle}>
        <FormattedMessage id="signup.title" />
      </h1>
      <Form
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="accountName"
          rules={[{ required: true, message: formatedMessage("signup.accountName-required") }]}
        >
          <Input size="large" placeholder={formatedMessage("signup.accountName-placeholder")} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{
            required: true,
            type: "email",
            message: formatedMessage("signup.email-required")
          }]}
        >
          <Input size="large" placeholder={formatedMessage("signup.email-placeholder")} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{
            required: true,
            min: PASSWORD_MIN_LENGTH,
            message: formatedMessage("signup.password-required")
          }]}
        >
          <Input.Password size="large" placeholder={formatedMessage("signup.password-placeholder")} />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            <FormattedMessage id="signup.button" />
          </Button>
        </Form.Item>
      </Form>
    </div >
  )
}
