import React from 'react';
import { useAccount } from '../../state/hooks';
import { AccountDetails } from './components/AccountDetails';

import styles from './Account.module.css';

export function Account() {
  const account = useAccount();

  if (!account) {
    return null;
  }

  return (
    <div className={styles.Account}>
      <AccountDetails account={account} />
    </div>
  );
}
