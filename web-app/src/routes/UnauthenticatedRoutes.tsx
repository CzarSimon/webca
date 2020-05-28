import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { SignUpContainer } from '../modules/signup';
import { LoginContainer } from '../modules/login';

export function UnauthenticatedRoutes() {
  return (
    <Router>
      <Switch>
        <Route path="/signup">
          <SignUpContainer />
        </Route>
        <Route exact path="/login">
          <LoginContainer />
        </Route>
      </Switch>
    </Router>
  );
}
