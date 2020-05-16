import React from 'react';
import log from '@czarsimon/remotelogger';
import { AuthenticationRequest } from '../../types';
import { SignUp } from './components/SignUp';

export function SignUpContainer() {
  const handleSignup = (req: AuthenticationRequest) => {
    log.info(`accountName=${req.accountName} email=${req.email} password=${req.password}`);
  }

  return <SignUp submit={handleSignup} />
}
