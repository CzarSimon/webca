import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Descriptions } from 'antd';
import { Account } from '../../../../types';
import { useFormatedMessage } from '../../../../translations';
import { DateTime } from '../../../../components/display/DateTime';

import styles from './AccountDetails.module.css';

interface Props {
  account: Account;
}

export function AccountDetails({ account }: Props) {
  const formattedMessage = useFormatedMessage();
  const { name, createdAt } = account;

  return (
    <div className={styles.AccountDetails}>
      <Descriptions
        column={2}
        layout="horizontal"
        title={
          <h2>
            <FormattedMessage id="account.title" />
          </h2>
        }
      >
        <Descriptions.Item label={formattedMessage('account.details.name-label')}>
          <p>{name}</p>
        </Descriptions.Item>
        <Descriptions.Item label={formattedMessage('account.details.createdAt-label')}>
          <DateTime value={createdAt} />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
