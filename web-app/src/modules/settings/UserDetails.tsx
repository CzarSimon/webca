import React from 'react';
import { FormattedMessage } from 'react-intl';
import { User } from '../../types';
import { Descriptions, Tag } from 'antd';
import { useFormatedMessage } from '../../translations';
import { ROLES } from '../../constants';

import styles from './UserDetails.module.css';

interface Props {
  user: User;
}

function roleColor(role: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'gold';
    case ROLES.USER:
      return 'blue';
    default:
      return 'default';
  }
}

export function UserDetails({ user }: Props) {
  const formattedMessage = useFormatedMessage();
  const { email, role, account } = user;

  return (
    <Descriptions
      column={2}
      layout="horizontal"
      title={
        <h2>
          <FormattedMessage id="userDetails.title" />
        </h2>
      }
    >
      <Descriptions.Item label={formattedMessage('userDetails.email-label')}>
        <p>{email}</p>
      </Descriptions.Item>

      <Descriptions.Item label={formattedMessage('userDetails.role-label')}>
        <div className={styles.TagItem}>
          <Tag color={roleColor(role)}>{role}</Tag>
        </div>
      </Descriptions.Item>

      <Descriptions.Item label={formattedMessage('userDetails.accountName-label')}>
        <p>{account.name}</p>
      </Descriptions.Item>
    </Descriptions>
  );
}
