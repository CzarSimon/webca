import React from 'react';
import { useDispatch } from "react-redux";
import { AuthenticationRequest } from '../../types';
import { SignUp } from './components/SignUp';
import { signUp } from '../../state/user';

export function SignUpContainer() {
  const dispatch = useDispatch();

  const handleSignup = (req: AuthenticationRequest) => {
    dispatch(signUp(req));
  }

  return <SignUp submit={handleSignup} />
}
