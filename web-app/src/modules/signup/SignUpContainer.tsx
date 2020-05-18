import React from 'react';
import { useDispatch } from "react-redux";
import { AuthenticationRequest } from '../../types';
import { SignUp } from './components/SignUp';
import { signUp } from '../../state/user';
import { useHistory } from 'react-router-dom';

export function SignUpContainer() {
  const dispatch = useDispatch();
  const history = useHistory();
  const onSignUp = (success: boolean) => {
    if (success) {
      history.push("/certificates/add");
    }
  };

  const handleSignup = (req: AuthenticationRequest) => {
    dispatch(signUp(req, onSignUp));
  }

  return <SignUp submit={handleSignup} />
}
