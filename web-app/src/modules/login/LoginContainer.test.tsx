import React from 'react';
import { screen, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../testutils';
import { LoginContainer } from './LoginContainer';
import { act } from 'react-dom/test-utils';
import { mockRequests, httpclient } from '../../api/httpclient';
import { store } from '../../state';
import { removeUser } from '../../state/user/actions';
import { User } from '../../types';
import { USER_ID_KEY, AUTH_TOKEN_KEY } from '../../constants';

beforeEach(() => {
  store.dispatch(removeUser());
  sessionStorage.clear();
});

const user: User = {
  id: 'a56b7c59-3b40-4d44-b264-21d4d9800f2c',
  email: 'test@mail.com',
  role: 'ADMIN',
  createdAt: '2020-05-16 08:30:20',
  updatedAt: '2020-05-16 08:30:20',
  account: {
    id: '8c804f01-2b26-4732-b22e-cb5fa15f29ca',
    name: 'test-account',
    createdAt: '2020-05-16 08:30:20',
    updatedAt: '2020-05-16 08:30:20',
  },
};

test('login: renders form and login works', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  mockRequests({
    '/api/v1/login': {
      body: {
        token: 'header.body.signature',
        user,
      },
      metadata: {
        method: 'GET',
        requestId: 'login-request-id',
        status: 200,
        url: '/api/v1/login',
      },
    },
  });

  render(<LoginContainer />);

  const title = screen.getByRole('heading', { name: /webca.io/ });
  expect(title).toBeInTheDocument();

  const accountNameInput = screen.getByPlaceholderText(/Account name/) as HTMLInputElement;
  expect(accountNameInput).toBeInTheDocument();
  expect(accountNameInput.value).toBe('');

  const emailInput = screen.getByPlaceholderText(/Email/) as HTMLInputElement;
  expect(emailInput).toBeInTheDocument();
  expect(emailInput.value).toBe('');

  const passwordInput = screen.getByPlaceholderText(/Password/) as HTMLInputElement;
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput.value).toBe('');

  const loginButton = screen.getByRole('button', { name: /Log in/ });
  expect(loginButton).toBeInTheDocument();

  const singupLink = screen.getByRole('link', { name: /Sign up/ });
  expect(singupLink).toBeInTheDocument();

  // Check that required warnings ARE NOT displayed.
  expect(screen.queryByText(/account name is required/i)).toBeFalsy();
  expect(screen.queryByText(/email is required/i)).toBeFalsy();
  expect(screen.queryByText(/password is required/i)).toBeFalsy();

  userEvent.click(loginButton);

  await wait(
    () => {
      // Check that required warnings ARE displayed.
      expect(screen.getByText(/account name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    },
    { timeout: 1000 },
  );

  await act(async () => {
    await userEvent.type(accountNameInput, user.account.name);
    await userEvent.type(emailInput, user.email);
    await userEvent.type(passwordInput, '68630b4dbe30f4a3cc62e3d69552dee2');
  });

  expect(accountNameInput.value).toBe(user.account.name);
  expect(emailInput.value).toBe(user.email);
  expect(passwordInput.value).toBe('68630b4dbe30f4a3cc62e3d69552dee2');

  // Check that required warnings NO LONGER displayed.
  expect(screen.queryByText(/account name is required/i)).toBeFalsy();
  expect(screen.queryByText(/email is required/i)).toBeFalsy();
  expect(screen.queryByText(/password is required/i)).toBeFalsy();

  userEvent.click(loginButton);
  await wait(
    () => {
      const state = store.getState();
      expect(state.user.loaded).toBe(true);
      expect(state.user.user).toBe(user);
      expect(httpclient.getHeaders()['Authorization']).toBe('Bearer header.body.signature');
      expect(window.location.pathname).toBe('/');
      expect(sessionStorage.getItem(USER_ID_KEY)).toBe(user.id);
      expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('header.body.signature');
    },
    { timeout: 1 },
  );
});

test('login: redirect to signup works', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  render(<LoginContainer />);

  const loginButton = screen.getByRole('button', { name: /log in/i });
  expect(loginButton).toBeInTheDocument();

  const singupLink = screen.getByRole('link', { name: /sign up/i });
  expect(singupLink).toBeInTheDocument();

  userEvent.click(singupLink);
  expect(window.location.pathname).toBe('/signup');
});

test('login: wrong password dispays error', async () => {
  // Assert being state
  expect(store.getState().user.user).toBeUndefined();

  mockRequests({
    '/api/v1/login': {
      metadata: {
        method: 'GET',
        requestId: 'login-request-id',
        status: 401,
        url: '/api/v1/login',
      },
      error: new Error('Unauthorized'),
    },
  });

  render(<LoginContainer />);

  const accountNameInput = screen.getByPlaceholderText(/Account name/) as HTMLInputElement;
  const emailInput = screen.getByPlaceholderText(/Email/) as HTMLInputElement;
  const passwordInput = screen.getByPlaceholderText(/Password/) as HTMLInputElement;

  await act(async () => {
    await userEvent.type(accountNameInput, user.account.name);
    await userEvent.type(emailInput, user.email);
    await userEvent.type(passwordInput, 'wrong-password');
  });

  expect(accountNameInput.value).toBe(user.account.name);
  expect(emailInput.value).toBe(user.email);
  expect(passwordInput.value).toBe('wrong-password');

  const loginButton = screen.getByRole('button', { name: /Log in/ });
  userEvent.click(loginButton);

  await wait(
    () => {
      expect(screen.getByText(/The account name, email and password do not match/i)).toBeInTheDocument();
      const state = store.getState();
      expect(state.user.loaded).toBe(false);
      expect(state.user.user).toBeUndefined();
      expect(window.location.pathname).not.toBe('/');
      expect(sessionStorage.getItem(USER_ID_KEY)).toBeNull();
      expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    },
    { timeout: 1 },
  );
});
