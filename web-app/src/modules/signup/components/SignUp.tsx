import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Input, Button } from 'antd';
import { AuthenticationRequest } from '../../../types';
import { useFormatedMessage } from '../../../translations';
import { Store } from 'antd/lib/form/interface';

interface Props {
  submit: (req: AuthenticationRequest) => void
}

export function SignUp(props: Props) {
  const formatedMessage = useFormatedMessage();

  const onFinish = ({ accountName, email, password }: Store) => {
    props.submit({ accountName, email, password });
  };

  return (
    <div>
      <h1>
        <FormattedMessage id="signup.title" />
      </h1>
      <Form onFinish={onFinish}>
        <Form.Item name="accountName">
          <Input placeholder={formatedMessage("signup.accountName-placeholder")} />
        </Form.Item>
        <Form.Item name="email">
          <Input placeholder={formatedMessage("signup.email-placeholder")} />
        </Form.Item>
        <Form.Item name="password">
          <Input.Password placeholder={formatedMessage("signup.password-placeholder")} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="signup.button" />
          </Button>
        </Form.Item>
      </Form>
    </div >
  )
}
