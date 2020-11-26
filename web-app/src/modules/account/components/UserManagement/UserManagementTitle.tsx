import React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import styles from './UserManagementTitle.module.css';

interface Props {
  createNewInvitation: () => void;
}

export function UserManagementTitle({ createNewInvitation }: Props) {
  return (
    <div className={styles.UserManagementTitle}>
      <h2>
        <FormattedMessage id="userManagement.title" />
      </h2>
      <Button onClick={createNewInvitation} type="primary">
        <FormattedMessage id="userManagement.inviteUser-button" />
      </Button>
    </div>
  );
}
