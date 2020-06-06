import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NewCertificateContainer, CertificateListContainer } from '../modules/certificates';
import { CertificateContainer } from '../modules/certificate';
import { SideMenu } from '../modules/navigation/SideMenu';

import styles from './AuthenticatedRoutes.module.css';

export function AuthenticatedRoutes() {
  return (
    <Router>
      <SideMenu />
      <div className={styles.AppContent}>
        <Switch>
          <Route exact path="/certificates/add">
            <NewCertificateContainer />
          </Route>
          <Route exact path="/certificates">
            <CertificateListContainer />
          </Route>
          <Route exact path="/certificates/:certificateId">
            <CertificateContainer />
          </Route>
          <Route path="/">
            <div />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
