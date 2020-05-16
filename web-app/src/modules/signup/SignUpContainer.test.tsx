import React from 'react';
import { SignUpContainer } from './SignUpContainer';
import { render } from '../../testutils';

test('renders form', () => {
  const r = render(<SignUpContainer />);
  const title = r.getByText(/webca.io/);
  expect(title).toBeInTheDocument();

  const accountNameInput = r.getByPlaceholderText(/Account name/);
  expect(accountNameInput).toBeInTheDocument();

  const emailInput = r.getByPlaceholderText(/Email/);
  expect(emailInput).toBeInTheDocument();

  const passwordInput = r.getByPlaceholderText(/Password/);
  expect(passwordInput).toBeInTheDocument();

  const signupButton = r.getByText(/Sign Up/);
  expect(signupButton).toBeInTheDocument();
});
