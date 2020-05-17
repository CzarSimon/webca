import React from 'react';
import { SignUpContainer } from './SignUpContainer';
import { render, fireEvent } from '../../testutils';
import { mockRequests } from '../../api/httpclient';

test('signup: renders form', () => {
  mockRequests({
    "/api/v1/signup": {
      body: {
        token: "header.body.signature",
        user: {
          id: "a56b7c59-3b40-4d44-b264-21d4d9800f2c",
          email: "test@mail.com",
          role: "ADMIN",
          createdAt: "2020-05-16 08:30:20",
          updatedAt: "2020-05-16 08:30:20",
          account: {
            id: "8c804f01-2b26-4732-b22e-cb5fa15f29ca",
            name: "test-account-name",
            createdAt: "2020-05-16 08:30:20",
            updatedAt: "2020-05-16 08:30:20",
          },
        },
      },
      metadata: {
        method: "GET",
        requestId: "signup-request-id",
        status: 200,
        url: '/api/v1/signup',
      }
    }
  })


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

  expect(accountNameInput.value).toBe("");
  fireEvent.change(accountNameInput, { target: { value: "test-account-name" } });
  expect(accountNameInput.value).toBe("test-account-name");

  expect(emailInput.value).toBe("");
  fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
  expect(emailInput.value).toBe("test@mail.com");

  expect(passwordInput.value).toBe("");
  fireEvent.change(passwordInput, { target: { value: "68630b4dbe30f4a3cc62e3d69552dee2" } });
  expect(passwordInput.value).toBe("68630b4dbe30f4a3cc62e3d69552dee2");

  fireEvent.click(signupButton);
});
