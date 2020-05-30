import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { CertificateContainer } from './CertificateContainer';
import { mockRequests } from '../../api/httpclient';
import { initStore } from '../../state';
import { Certificate, User } from '../../types';
import { addUser } from '../../state/user/actions';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    certificateId: 'd1b9c1e9-ce8f-4296-8671-3411105ceb45',
  }),
}));

beforeEach(() => {
  mockRequests({});
});

const rootCert: Certificate = {
  id: 'd1b9c1e9-ce8f-4296-8671-3411105ceb45',
  name: 'cert-1',
  body: 'pem formated certificate body',
  subject: {
    commonName: 'test root ca',
  },
  format: 'PEM',
  type: 'ROOT_CA',
  createdAt: '2020-05-16 08:30:20',
  accountId: '51f5435d-0841-4538-a484-7489257f6245',
};

const cert: Certificate = {
  id: rootCert.id,
  name: 'cert-2',
  body: 'pem formated certificate body',
  subject: {
    commonName: 'test certificate',
  },
  format: 'PEM',
  type: 'CERTIFICATE',
  createdAt: '2020-05-19 08:30:20',
  accountId: '51f5435d-0841-4538-a484-7489257f6245',
};

const admin: User = {
  id: 'ba8e146a-c498-465c-835e-dcf6c4421b66',
  email: 'admin@webca.io',
  role: 'ADMIN',
  createdAt: '2020-05-19 08:30:20',
  updatedAt: '2020-05-19 08:30:20',
  account: {
    id: rootCert.accountId,
    name: 'test-account',
    createdAt: '2020-05-19 08:30:20',
    updatedAt: '2020-05-19 08:30:20',
  },
};

const user: User = {
  ...admin,
  id: '3bab313e-539e-46a7-9f53-3c528964285d',
  email: 'user@webca.io',
  role: 'USER',
};

test('certificate page: renders root certificate', async () => {
  const store = initStore();
  store.dispatch(addUser(admin));
  mockRequests({
    [`/api/v1/certificates/${rootCert.id}`]: {
      body: rootCert,
      metadata: {
        method: 'GET',
        requestId: 'get-root-certificate-req-id',
        status: 200,
        url: `/api/v1/certificates/${rootCert.id}`,
      },
    },
  });

  await act(async () => {
    render(<CertificateContainer />, { reduxStore: store });
  });

  expect(screen.getByText('Basic details')).toBeInTheDocument();
  expect(screen.getByText('Subject')).toBeInTheDocument();

  expect(screen.getByText('cert-1')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('Root CA')).toBeInTheDocument();
  expect(screen.getByText('Common name')).toBeInTheDocument();
  expect(screen.getByText('test root ca')).toBeInTheDocument();
  expect(screen.getByText('Created At')).toBeInTheDocument();
  expect(screen.getByText('2020-05-16 08:30:20')).toBeInTheDocument();

  const bodyCollapse = screen.getByText('Body');
  expect(bodyCollapse).toBeInTheDocument();
  expect(screen.queryByText('pem formated certificate body')).toBeFalsy();
  await act(async () => userEvent.click(bodyCollapse));
  expect(screen.getByText('pem formated certificate body')).toBeInTheDocument();

  const downloadButton = screen.getByRole('button', { name: /download certificate/i });
  expect(downloadButton).toBeInTheDocument();
  expect(downloadButton).toBeEnabled();
  const downloadPrivateKeyButton = screen.getByRole('button', { name: /download private key/i });
  expect(downloadPrivateKeyButton).toBeInTheDocument();
  expect(downloadPrivateKeyButton).toBeEnabled();
});

test('certificate page: render certificate', async () => {
  const store = initStore();
  store.dispatch(addUser(admin));
  mockRequests({
    [`/api/v1/certificates/${cert.id}`]: {
      body: cert,
      metadata: {
        method: 'GET',
        requestId: 'get-certificate-req-id',
        status: 200,
        url: `/api/v1/certificates/${cert.id}`,
      },
    },
  });

  await act(async () => {
    render(<CertificateContainer />, { reduxStore: store });
  });

  expect(screen.getByText('Basic details')).toBeInTheDocument();
  expect(screen.getByText('Subject')).toBeInTheDocument();

  expect(screen.getByText('cert-2')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('Certificate')).toBeInTheDocument();
  expect(screen.getByText('Common name')).toBeInTheDocument();
  expect(screen.getByText('test certificate')).toBeInTheDocument();
  const downloadButton = screen.getByRole('button', { name: /download certificate chain/i });
  expect(downloadButton).toBeInTheDocument();
  expect(downloadButton).toBeEnabled();
  const downloadPrivateKeyButton = screen.getByRole('button', { name: /download private key/i });
  expect(downloadPrivateKeyButton).toBeInTheDocument();
  expect(downloadPrivateKeyButton).toBeEnabled();
});

test('certificate page: certficiate loading', async () => {
  const store = initStore();
  store.dispatch(addUser(admin));
  mockRequests({
    [`/api/v1/certificates/${rootCert.id}`]: {
      body: rootCert,
      metadata: {
        method: 'GET',
        requestId: 'get-certificate-req-id',
        status: 503,
        url: `/api/v1/certificates/${rootCert.id}`,
      },
    },
  });

  await act(async () => {
    render(<CertificateContainer />, { reduxStore: store });
  });

  expect(screen.queryByText('cert-1')).toBeFalsy();
  expect(screen.queryByText('Root CA')).toBeFalsy();
  expect(screen.queryByText('test root ca')).toBeFalsy();
  const downloadButton = screen.getByRole('button', { name: /download certificate/i });
  expect(downloadButton).toBeInTheDocument();
  expect(downloadButton).toBeDisabled();
  const downloadPrivateKeyButton = screen.getByRole('button', { name: /download private key/i });
  expect(downloadPrivateKeyButton).toBeInTheDocument();
  expect(downloadPrivateKeyButton).toBeDisabled();
});

test('certificate page: render certificate as user, should not show private key button', async () => {
  const store = initStore();
  store.dispatch(addUser(user));
  mockRequests({
    [`/api/v1/certificates/${cert.id}`]: {
      body: cert,
      metadata: {
        method: 'GET',
        requestId: 'get-certificate-req-id',
        status: 200,
        url: `/api/v1/certificates/${cert.id}`,
      },
    },
  });

  await act(async () => {
    render(<CertificateContainer />, { reduxStore: store });
  });

  expect(screen.getByText('Basic details')).toBeInTheDocument();
  expect(screen.getByText('Subject')).toBeInTheDocument();

  expect(screen.getByText('cert-2')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('Certificate')).toBeInTheDocument();
  expect(screen.getByText('Common name')).toBeInTheDocument();
  expect(screen.getByText('test certificate')).toBeInTheDocument();
  const downloadButton = screen.getByRole('button', { name: /download certificate chain/i });
  expect(downloadButton).toBeInTheDocument();
  expect(downloadButton).toBeEnabled();
  expect(screen.queryByRole('button', { name: /download private key/i })).toBeFalsy();
});
