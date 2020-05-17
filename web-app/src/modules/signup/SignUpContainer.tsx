import React from 'react';
import log from '@czarsimon/remotelogger';
import { AuthenticationRequest } from '../../types';
import { SignUp } from './components/SignUp';
import { signupUser } from '../../api';

export function SignUpContainer() {
  const handleSignup = (req: AuthenticationRequest) => {
    localStorage.setItem("signup-render-form-res", "some-val");
    log.info(`signup: accountName=${req.accountName} email=${req.email} password=${req.password}`);
    signupUser(req);
  }

  return <SignUp submit={handleSignup} />
}
