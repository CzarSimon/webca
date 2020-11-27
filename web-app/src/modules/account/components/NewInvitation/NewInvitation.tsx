import React from 'react';
import log from '@czarsimon/remotelogger';
import { Button, Form, Input } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Store } from 'antd/lib/form/interface';
import { Dropdown } from '../../../../components/from';
import { useFormSelect } from '../../../../state/hooks';
import { useFormatedMessage } from '../../../../translations';
import { ROLES } from '../../../../constants';
import { InvitationCreationRequest } from '../../../../types';

import styles from './NewInvitation.module.css';

interface Props {
  submit: (req: InvitationCreationRequest) => void;
}

const roleOptions = Object.values(ROLES).map((role) => ({ id: role, text: role }));

export function NewInvitation({ submit }: Props) {
  const formattedMessage = useFormatedMessage();
  const { form, onSelect } = useFormSelect();

  const selectRole = (value: string) => {
    onSelect('role')(value);
  };

  const onFinish = ({ email, role }: Store) => {
    submit({ email, role });
  };

  const onFinishFailed = (errorInfo: any) => {
    log.info(`Create invitation input failed. Error: ${JSON.stringify(errorInfo.errorFields)} `);
  };

  return (
    <div className={styles.NewInvitation}>
      <div className={styles.Content}>
        <h1>
          <FormattedMessage id="newInvitation.title" />
        </h1>
        <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: formattedMessage('newInvitation.email-required') }]}
          >
            <Input
              size="large"
              type="email"
              placeholder={formattedMessage('newInvitation.email-placeholder')}
              autoFocus
            />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: formattedMessage('newInvitation.role-required') }]}>
            <Dropdown
              size="large"
              placeholder={formattedMessage('newInvitation.role-placeholder')}
              options={roleOptions}
              onSelect={selectRole}
            />
          </Form.Item>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block>
              <FormattedMessage id="newInvitation.button" />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
