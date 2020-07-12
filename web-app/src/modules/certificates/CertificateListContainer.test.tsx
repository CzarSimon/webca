import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { CertificateListContainer } from './CertificateListContainer';
import { mockRequests } from '../../api/httpclient';
import { store } from '../../state';
import { CertificatePage, User } from '../../types';
import { addUser } from '../../state/user/actions';
import { removeCertificates } from '../../state/certificates/actions';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  store.dispatch(removeCertificates());
});

const accountId = '51f5435d-0841-4538-a484-7489257f6245';
const certs: CertificatePage = {
  currentPage: 1,
  totalPages: 2,
  totalResults: 3,
  resultsPerPage: 2,
  results: [
    {
      id: 'd1b9c1e9-ce8f-4296-8671-3411105ceb45',
      name: 'cert-1',
      body: 'pem formated certificate body',
      subject: {
        commonName: 'test root ca',
      },
      format: 'PEM',
      type: 'ROOT_CA',
      createdAt: '2020-05-16 08:30:20',
      expiresAt: '2021-05-16 08:30:20',
      accountId,
    },
    {
      id: '26b679f0-ad89-4290-84a3-02f16ee23c09',
      name: 'cert-2',
      body: 'pem formated certificate body',
      subject: {
        commonName: 'test root ca',
      },
      format: 'PEM',
      type: 'CERTIFICATE',
      createdAt: '2020-05-20 08:30:20',
      expiresAt: '2021-05-20 08:30:20',
      accountId,
    },
  ],
};

const user: User = {
  id: '7bda829e-ccd6-4c84-b5ae-c70f8445043b',
  email: 'user@webca.io',
  role: 'USER',
  createdAt: 'some-date',
  updatedAt: 'some-date',
  account: {
    id: accountId,
    name: 'test-account',
    createdAt: 'some-date',
    updatedAt: 'some-date',
  },
};

test('certificate list: fetches certificates and renders table', async () => {
  store.dispatch(addUser(user));
  mockRequests({
    [`/api/v1/certificates?accountId=${accountId}`]: {
      body: certs,
      metadata: {
        method: 'GET',
        requestId: 'get-certificates-request-id',
        status: 200,
        url: '/api/v1/certificates',
      },
    },
  });

  await act(async () => {
    render(<CertificateListContainer />);
  });

  expect(screen.getByRole('heading', { name: /certificates/i }));

  // Check table columns
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText(/certificate type/i)).toBeInTheDocument();
  expect(screen.getByText(/created at/i)).toBeInTheDocument();
  expect(screen.getByText(/expires at/i)).toBeInTheDocument();

  // Check table data
  expect(screen.getByText('cert-1')).toBeInTheDocument();
  expect(screen.getByText('Root CA')).toBeInTheDocument();
  expect(screen.getByText('2020-05-16 08:30:20')).toBeInTheDocument();

  expect(screen.getByText('cert-2')).toBeInTheDocument();
  expect(screen.getByText(/^Certificate$/)).toBeInTheDocument();
  expect(screen.getByText('2020-05-20 08:30:20')).toBeInTheDocument();
  expect(screen.getByText('2021-05-20 08:30:20')).toBeInTheDocument();

  const newCertButton = screen.getByRole('button', { name: /new certificate/i });
  expect(newCertButton).toBeInTheDocument();

  const cert1 = screen.getByText('cert-1');
  expect(cert1).toBeInTheDocument();

  await act(async () => userEvent.click(cert1));
  expect(window.location.pathname).toBe(`/certificates/${certs.results[0].id}`);
});

test('certificate list: fetches certificates and renders table', async () => {
  store.dispatch(addUser(user));
  mockRequests({
    [`/api/v1/certificates?accountId=${accountId}`]: {
      body: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        resultsPerPage: 0,
        results: [],
      },
      metadata: {
        method: 'GET',
        requestId: 'get-certificates-request-id',
        status: 200,
        url: '/api/v1/certificates',
      },
    },
  });

  await act(async () => {
    render(<CertificateListContainer />);
  });

  expect(screen.getByRole('heading', { name: /certificates/i }));

  // Check table columns.
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText(/certificate type/i)).toBeInTheDocument();
  expect(screen.getByText(/created at/i)).toBeInTheDocument();
  expect(screen.getByText(/expires at/i)).toBeInTheDocument();

  // Check that no data is present.
  expect(screen.getByText(/no data/i)).toBeInTheDocument();

  const newCertButton = screen.getByRole('button', { name: /new certificate/i });
  expect(newCertButton).toBeInTheDocument();

  await act(async () => userEvent.click(newCertButton));
  expect(window.location.pathname).toBe('/certificates/add');
});
