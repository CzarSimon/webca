import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { SignUpContainer } from '../modules/signup';
import { LoginContainer } from '../modules/login';

import styles from './UnauthenticatedRoutes.module.css';

export function UnauthenticatedRoutes() {
  return (
    <Router>
      <div className={styles.Content}>
        <Switch>
          <Route path="/signup">
            <SignUpContainer />
          </Route>
          <Route exact path="/login">
            <LoginContainer />
          </Route>
          <Route path="/">
            <SignUpContainer />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
