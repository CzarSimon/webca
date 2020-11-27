import React from 'react';
import { act, wait, screen, fireEvent } from '@testing-library/react';
import { render } from '../../testutils';
import { initStore } from '../../state';
import { Invitation, User } from '../../types';
import { addUser } from '../../state/user/actions';
import userEvent from '@testing-library/user-event';
import { mockRequests } from '../../api/httpclient';
import { NewInvitationContainer } from './NewInvitationContainer';

jest.mock('../../components/from/dropdown/Dropdown');

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

const inivte: Invitation = {
  id: '10fd3fe1-9efe-4cc3-93d8-aea04bbb287a',
  email: 'new.user@webca.io',
  role: 'ADMIN',
  status: 'CREATED',
  createdById: user.id,
  account: user.account,
  createdAt: '2020-10-15T23:05:32Z',
  validTo: '2020-11-15T23:05:32Z',
};

test('can create and submit a new invitation', async () => {
  mockRequests({
    '/api/v1/invitations': {
      body: inivte,
      metadata: {
        method: 'POST',
        requestId: 'post-invitation-request-id',
        status: 200,
        url: '/api/v1/invitations',
      },
    },
  });

  const store = initStore();
  store.dispatch(addUser(user));

  await act(async () => {
    render(<NewInvitationContainer />, { reduxStore: store });
  });

  expect(screen.getByRole('heading', { name: 'Create new invitation' })).toBeInTheDocument();

  const emailInput = screen.getByPlaceholderText(/Email/) as HTMLInputElement;
  expect(emailInput).toBeInTheDocument();
  expect(emailInput.value).toBe('');
  fireEvent.change(emailInput, { target: { value: 'new.user@webca.io' } });
  expect(emailInput.value).toBe('new.user@webca.io');

  const roleDropdown = screen.getByPlaceholderText(/Role/) as HTMLInputElement;
  expect(roleDropdown).toBeInTheDocument();
  await act(async () => userEvent.click(roleDropdown));
  await act(async () => {
    fireEvent.change(roleDropdown, { target: { value: 'ADMIN' } });
  });

  const sendInvitationButton = screen.getByRole('button', { name: 'Send invitation' });
  expect(sendInvitationButton).toBeInTheDocument();

  await act(async () => userEvent.click(sendInvitationButton));
  await wait(
    () => {
      expect(window.location.pathname).toBe('/account');
    },
    { timeout: 1 },
  );
});

test('invitation without correct values is not submitted', async () => {
  mockRequests({
    '/api/v1/invitations': {
      body: inivte,
      metadata: {
        method: 'POST',
        requestId: 'post-invitation-request-id',
        status: 200,
        url: '/api/v1/invitations',
      },
    },
  });

  const store = initStore();
  store.dispatch(addUser(user));

  await act(async () => {
    render(<NewInvitationContainer />, { reduxStore: store });
  });

  expect(screen.getByRole('heading', { name: 'Create new invitation' })).toBeInTheDocument();

  const emailInput = screen.getByPlaceholderText(/Email/) as HTMLInputElement;
  expect(emailInput).toBeInTheDocument();
  expect(emailInput.value).toBe('');

  const roleDropdown = screen.getByPlaceholderText(/Role/) as HTMLInputElement;
  expect(roleDropdown).toBeInTheDocument();

  await wait(
    () => {
      const sendInvitationButton = screen.getByRole('button', { name: 'Send invitation' });
      expect(sendInvitationButton).toBeInTheDocument();

      fireEvent.click(sendInvitationButton);

      // Check that required warning texts ARE displayed.
      expect(screen.queryByText(/email is required/i)).toBeTruthy();
      expect(screen.queryByText(/role needs to be set/i)).toBeTruthy();
    },
    { timeout: 1 },
  );
});
