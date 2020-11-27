import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { UserManagementContainer } from './UserManagementContainer';
import { initStore } from '../../state';
import { User } from '../../types';
import { addUser } from '../../state/user/actions';
import userEvent from '@testing-library/user-event';

const user: User = {
  id: 'f5a2c2df-a293-4899-994a-ccec242e932f',
  email: 'admin@webca.io',
  role: 'ADMIN',
  createdAt: '2020-10-13T23:05:32Z',
  updatedAt: '2020-10-13T23:05:32Z',
  account: {
    id: '56da2101-ff20-4728-b517-b48eba84a654',
    name: 'test-account',
    createdAt: '2020-10-12T23:05:32Z',
    updatedAt: '2020-10-13T23:05:32Z',
  },
};

test('user management list rendered', async () => {
  const store = initStore();
  store.dispatch(addUser(user));

  await act(async () => {
    render(<UserManagementContainer />, { reduxStore: store });
  });

  expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
  expect(screen.getByText(/role/i)).toBeInTheDocument();
  expect(screen.getByText(/created at/i)).toBeInTheDocument();

  const inviteButton = screen.getByRole('button', { name: 'Invite user' });
  expect(inviteButton).toBeInTheDocument();

  await act(async () => userEvent.click(inviteButton));
  expect(window.location.pathname).toBe('/invitations/add');
});
