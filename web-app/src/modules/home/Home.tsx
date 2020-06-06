import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'antd';

import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.Home}>
      <Typography.Title>
        <FormattedMessage id="home.title" />
      </Typography.Title>
      <p>
        <FormattedMessage id="home.subtitle" />
      </p>
    </div>
  );
}
