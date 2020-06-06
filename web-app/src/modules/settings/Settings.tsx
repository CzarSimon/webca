import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import { useUserState } from '../../state/hooks';
import { logout } from '../../state/user';
import { UserDetails } from './UserDetails';

import styles from './Settings.module.css';

export function Settings() {
  const { user } = useUserState();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout(user));
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.Settings}>
      <UserDetails user={user} />
      <Button onClick={handleLogout}>
        <FormattedMessage id="settings.logout-button" />
      </Button>
    </div>
  );
}
