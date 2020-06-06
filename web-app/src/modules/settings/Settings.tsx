import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import { useUserState } from '../../state/hooks';
import { logout } from '../../state/user';

export function Settings() {
  const { user } = useUserState();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout(user));
  };

  return (
    <div>
      <Button onClick={handleLogout}>
        <FormattedMessage id="settings.logout-button" />
      </Button>
    </div>
  );
}
