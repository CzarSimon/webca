import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../testutils';
import { Settings } from './Settings';
import { initStore } from '../../state';
import { User } from '../../types';
import { addUser } from '../../state/user/actions';
import { USER_ID_KEY, AUTH_TOKEN_KEY, CLIENT_ID_KEY } from '../../constants';

const user: User = {
  id: 'ba8e146a-c498-465c-835e-dcf6c4421b66',
  email: 'admin@webca.io',
  role: 'ADMIN',
  createdAt: '2020-05-19 08:30:20',
  updatedAt: '2020-05-19 08:30:20',
  account: {
    id: '51f5435d-0841-4538-a484-7489257f6245',
    name: 'test-account',
    createdAt: '2020-05-19 08:30:20',
    updatedAt: '2020-05-19 08:30:20',
  },
};

beforeEach(() => {
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.setItem(CLIENT_ID_KEY, 'some-persistant-uuid');
});

test('settings component should render user details, and allow the user to log out', async () => {
  const store = initStore();
  store.dispatch(addUser(user));
  sessionStorage.setItem(USER_ID_KEY, user.id);
  sessionStorage.setItem(AUTH_TOKEN_KEY, 'user.jwt.token');

  await act(async () => {
    render(<Settings />, { reduxStore: store });
  });

  expect(screen.getByRole('heading', { name: 'User details' })).toBeInTheDocument();
  expect(screen.getByText('Email')).toBeInTheDocument();
  expect(screen.getByText('admin@webca.io')).toBeInTheDocument();
  expect(screen.getByText('Role')).toBeInTheDocument();
  expect(screen.getByText('ADMIN')).toBeInTheDocument();
  expect(screen.getByText('Account name')).toBeInTheDocument();
  expect(screen.getByText('test-account')).toBeInTheDocument();

  const logoutButton = screen.getByRole('button', { name: 'Log out' });
  expect(logoutButton).toBeInTheDocument();

  expect(sessionStorage.getItem(USER_ID_KEY)).toBe(user.id);
  expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('user.jwt.token');
  expect(localStorage.getItem(CLIENT_ID_KEY)).toBe('some-persistant-uuid');

  await act(async () => userEvent.click(logoutButton));

  expect(sessionStorage.getItem(USER_ID_KEY)).toBeNull();
  expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  expect(localStorage.getItem(CLIENT_ID_KEY)).toBe('some-persistant-uuid');
});
