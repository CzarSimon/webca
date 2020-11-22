import React from 'react';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import { ClickParam } from 'antd/lib/menu';
import log from '@czarsimon/remotelogger';
import { useHistory } from 'react-router-dom';

import styles from './SideMenu.module.css';

export function SideMenu() {
  const history = useHistory();

  const gotoPath = (path: string) => {
    log.info(`selected menu item: ${path}`);
    history.push(path);
  };

  const onSelect = ({ key }: ClickParam) => {
    gotoPath(`/${key}`);
  };

  return (
    <Menu onClick={onSelect} mode="inline" style={{ width: 256 }}>
      <h1 className={styles.Title} onClick={() => gotoPath('/')}>
        <FormattedMessage id="sideMenu.title" />
      </h1>
      <Menu.Item key="certificates">
        <p className={styles.MenuItem}>
          <FormattedMessage id="sideMenu.certificates-item" />
        </p>
      </Menu.Item>
      <Menu.Item key="account">
        <p className={styles.MenuItem}>
          <FormattedMessage id="sideMenu.account-item" />
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
