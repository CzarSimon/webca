import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { Account } from './Account';
import { initStore } from '../../state';
import { User } from '../../types';
import { addUser } from '../../state/user/actions';

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

test('account header should render', async () => {
  const store = initStore();
  store.dispatch(addUser(user));

  await act(async () => {
    render(<Account />, { reduxStore: store });
  });

  expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('test-account')).toBeInTheDocument();
  expect(screen.getByText('Created at')).toBeInTheDocument();
  expect(screen.getByText('10/12/2020, 11:05:32 PM')).toBeInTheDocument();
});
