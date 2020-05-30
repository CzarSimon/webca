import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NewCertificateContainer, CertificateListContainer } from '../modules/certificates';
import { CertificateContainer } from '../modules/certificate';

export function AuthenticatedRoutes() {
  return (
    <Router>
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
    </Router>
  );
}
