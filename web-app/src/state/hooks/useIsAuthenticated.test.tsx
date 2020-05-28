import React from 'react';
import { Provider } from 'react-redux';
import { useIsAuthenticated } from '.';
import { initStore } from '../';
import { removeUser, addUser } from '../user/actions';
import { USER_ID_KEY, AUTH_TOKEN_KEY } from '../../constants';
import { render, screen, act } from '@testing-library/react';
import { User } from '../../types';
import { mockRequests } from '../../api/httpclient';

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

const store = initStore();

function UseIsAuthenticatedExample() {
  const authenticated = useIsAuthenticated();

  return <p>{authenticated ? 'true' : 'false'}</p>;
}

function TestApp() {
  return (
    <Provider store={store}>
      <UseIsAuthenticatedExample />
    </Provider>
  );
}

beforeEach(() => {
  store.dispatch(removeUser());
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
});

test('useIsAuthenticated: user not loaded and session storage empty, should return false', async () => {
  await act(async () => {
    render(<TestApp />);
  });

  expect(screen.getByText(/false/)).toBeInTheDocument();
  expect(screen.queryByText(/true/)).toBeFalsy();
});

test('useIsAuthenticated: user is loaded and session storage empty, should return true', async () => {
  store.dispatch(addUser(user));

  await act(async () => {
    render(<TestApp />);
  });

  expect(screen.getByText(/true/)).toBeInTheDocument();
  expect(screen.queryByText(/false/)).toBeFalsy();
});

test('useIsAuthenticated: user is loaded and session storage set, should return true', async () => {
  store.dispatch(addUser(user));
  sessionStorage.setItem(USER_ID_KEY, user.id);
  sessionStorage.setItem(AUTH_TOKEN_KEY, 'ok.auth.token');

  await act(async () => {
    render(<TestApp />);
  });

  expect(screen.getByText(/true/)).toBeInTheDocument();
  expect(screen.queryByText(/false/)).toBeFalsy();
});

test('useIsAuthenticated: user not loaded and session storage has an expired auth key, should return false', async () => {
  mockRequests({
    [`/api/v1/users/${user.id}`]: {
      metadata: {
        method: 'GET',
        status: 401,
        url: `/api/v1/users/${user.id}`,
      },
    },
  });
  sessionStorage.setItem(USER_ID_KEY, user.id);
  sessionStorage.setItem(AUTH_TOKEN_KEY, 'expired.auth.token');

  await act(async () => {
    render(<TestApp />);
  });

  expect(screen.getByText(/false/)).toBeInTheDocument();
  expect(screen.queryByText(/true/)).toBeFalsy();
});

test('useIsAuthenticated: user not loaded and session storage has an ok auth key, should return true', async () => {
  mockRequests({
    [`/api/v1/users/${user.id}`]: {
      body: user,
      metadata: {
        method: 'GET',
        status: 200,
        url: `/api/v1/users/${user.id}`,
      },
    },
  });
  sessionStorage.setItem(USER_ID_KEY, user.id);
  sessionStorage.setItem(AUTH_TOKEN_KEY, 'ok.auth.token');

  await act(async () => {
    render(<TestApp />);
  });

  expect(screen.getByText(/true/)).toBeInTheDocument();
  expect(screen.queryByText(/false/)).toBeFalsy();
});
