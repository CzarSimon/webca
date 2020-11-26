import React, { Fragment } from 'react';
import { useAccount } from '../../state/hooks';
import { AccountDetails } from './components/AccountDetails';
import { UserManagementContainer } from './UserManagementContainer';

export function Account() {
  const account = useAccount();

  if (!account) {
    return null;
  }

  return (
    <Fragment>
      <AccountDetails account={account} />
      <UserManagementContainer />
    </Fragment>
  );
}
