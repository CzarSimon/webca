import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NewCertificateContainer } from '../modules/certificates';

export function AuthenticatedRoutes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/certificates/add">
          <NewCertificateContainer />
        </Route>
        <Route path="/">
          <div />
        </Route>
      </Switch>
    </Router>
  );
}
