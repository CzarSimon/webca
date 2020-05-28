import React from 'react';
import { screen, wait } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { SignUpContainer } from './SignUpContainer';
import { render, fireEvent } from '../../testutils';
import { mockRequests, httpclient } from '../../api/httpclient';
import { store } from '../../state';
import { removeUser } from '../../state/user/actions';

beforeEach(() => {
  store.dispatch(removeUser());
});

test('signup: renders form', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  const user = {
    id: 'a56b7c59-3b40-4d44-b264-21d4d9800f2c',
    email: 'test@mail.com',
    role: 'ADMIN',
    createdAt: '2020-05-16 08:30:20',
    updatedAt: '2020-05-16 08:30:20',
    account: {
      id: '8c804f01-2b26-4732-b22e-cb5fa15f29ca',
      name: 'test-account-name',
      createdAt: '2020-05-16 08:30:20',
      updatedAt: '2020-05-16 08:30:20',
    },
  };
  mockRequests({
    '/api/v1/signup': {
      body: {
        token: 'header.body.signature',
        user,
      },
      metadata: {
        method: 'GET',
        requestId: 'signup-request-id',
        status: 200,
        url: '/api/v1/signup',
      },
    },
  });

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

  expect(accountNameInput.value).toBe('');
  fireEvent.change(accountNameInput, { target: { value: 'test-account-name' } });
  expect(accountNameInput.value).toBe('test-account-name');

  expect(emailInput.value).toBe('');
  fireEvent.change(emailInput, { target: { value: 'test@mail.com' } });
  expect(emailInput.value).toBe('test@mail.com');

  expect(passwordInput.value).toBe('');
  fireEvent.change(passwordInput, { target: { value: '68630b4dbe30f4a3cc62e3d69552dee2' } });
  expect(passwordInput.value).toBe('68630b4dbe30f4a3cc62e3d69552dee2');

  fireEvent.click(signupButton);
  await wait(
    () => {
      const state = store.getState();
      expect(state.user.loaded).toBe(true);
      expect(state.user.user).toBe(user);
      expect(httpclient.getHeaders()['Authorization']).toBe('Bearer header.body.signature');
      expect(window.location.pathname).toBe('/certificates/add');
    },
    { timeout: 1 },
  );
});

test('signup: test required fields', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  let r: ReturnType<typeof render>;
  await act(async () => {
    r = render(<SignUpContainer />);
  });

  await wait(
    () => {
      const title = r.getByText(/webca.io/);
      expect(title).toBeInTheDocument();

      // Check that required warning texts ARE NOT displayed.
      expect(r.queryByText(/Please provide an account name/)).toBeFalsy();
      expect(r.queryByText(/A valid email is required/)).toBeFalsy();
      expect(r.queryByText(/At least 16 charactes are required in password/)).toBeFalsy();
    },
    { timeout: 1000 },
  );

  await wait(
    () => {
      const signupButton = r.getByText(/Sign Up/);
      expect(signupButton).toBeInTheDocument();
      fireEvent.click(signupButton);

      // Check that required warning texts ARE displayed.
      expect(r.queryByText(/Please provide an account name/)).toBeTruthy();
      expect(r.queryByText(/A valid email is required/)).toBeTruthy();
      expect(r.queryByText(/At least 16 charactes are required in password/)).toBeTruthy();
    },
    { timeout: 1000 },
  );

  const state = store.getState();
  expect(state.user.loaded).toBe(false);
  expect(state.user.user).toBeUndefined();
});

test('login: redirect to signup works', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  render(<SignUpContainer />);

  const signupButton = screen.getByRole('button', { name: /sign up/i });
  expect(signupButton).toBeInTheDocument();

  const loginLink = screen.getByRole('link', { name: /log in/i });
  expect(loginLink).toBeInTheDocument();

  userEvent.click(loginLink);
  expect(window.location.pathname).toBe('/login');
});
