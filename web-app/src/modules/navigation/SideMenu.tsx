import React from 'react';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import { ClickParam } from 'antd/lib/menu';
import log from '@czarsimon/remotelogger';
import { useHistory } from 'react-router-dom';

import styles from './SideMenu.module.css';

export function SideMenu() {
  const history = useHistory();

  const onSelect = ({ key }: ClickParam) => {
    log.info(`selected menu item: ${key}`);
    history.push(`/${key}`);
  };

  return (
    <Menu onClick={onSelect} mode="inline" style={{ width: 256 }}>
      <h1 className={styles.Title}>
        <FormattedMessage id="sideMenu.title" />
      </h1>
      <Menu.Item key="certificates">
        <p className={styles.MenuItem}>
          <FormattedMessage id="sideMenu.certificates-item" />
        </p>
      </Menu.Item>
      <Menu.Item key="settings">
        <p className={styles.MenuItem}>
          <FormattedMessage id="sideMenu.settings-item" />
        </p>
      </Menu.Item>
    </Menu>
  );
}
