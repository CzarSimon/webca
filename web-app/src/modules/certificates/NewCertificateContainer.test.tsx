import React from 'react';
import { act, wait, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../testutils';
import { CertificateOptions, Certificate } from '../../types';
import { NewCertificateContainer } from './NewCertificateContainer';
import { mockRequests } from '../../api/httpclient';
import { removeOptions } from '../../state/certificates';
import { store } from '../../state';

jest.mock('../../components/from/dropdown/Dropdown');

const opts: CertificateOptions = {
  types: [
    {
      name: 'ROOT_CA',
      active: true,
      createdAt: '2020-05-16 08:30:20',
      updatedAt: '2020-05-16 08:30:20',
    },
    {
      name: 'INTERMEDIATE_CA',
      active: true,
      createdAt: '2020-05-16 08:30:20',
      updatedAt: '2020-05-16 08:30:20',
    },
    {
      name: 'CERTIFICATE',
      active: true,
      createdAt: '2020-05-16 08:30:20',
      updatedAt: '2020-05-16 08:30:20',
    },
  ],
  algorithms: ['RSA'],
  formats: ['PEM'],
};

const cert: Certificate = {
  id: '14597ed1-281f-495a-8366-4f8a411a20bc',
  name: 'test root ca',
  body: 'pem formated certificate body',
  subject: {
    commonName: 'test root ca',
  },
  format: opts.formats[0],
  type: opts.types[0].name,
  accountId: '51f5435d-0841-4538-a484-7489257f6245',
  createdAt: '2020-05-16 08:30:20',
};

test('new certificate: renders form', async () => {
  mockRequests({
    '/api/v1/certificate-options': {
      body: opts,
      metadata: {
        method: 'GET',
        requestId: 'get-certificate-options-request-id',
        status: 200,
        url: '/api/v1/certificate-options',
      },
    },
    '/api/v1/certificates': {
      body: cert,
      metadata: {
        method: 'POST',
        requestId: 'post-certificate-req-id',
        status: 200,
        url: '/api/v1/certificates',
      },
    },
  });

  await act(async () => render(<NewCertificateContainer />));

  await wait(
    () => {
      const state = store.getState();
      expect(state.certificates.options).toBe(opts);

      expect(screen.getByText(/Create new certificate/)).toBeInTheDocument();
    },
    { timeout: 1000 },
  );

  const nameInput = screen.getByPlaceholderText(/Name/) as HTMLInputElement;
  expect(nameInput).toBeInTheDocument();
  expect(nameInput.value).toBe('');
  fireEvent.change(nameInput, { target: { value: 'test-root-ca' } });
  expect(nameInput.value).toBe('test-root-ca');

  expect(screen.getByText(/Subject/)).toBeInTheDocument();

  const commonNameInput = screen.getByPlaceholderText(/Common name/) as HTMLInputElement;
  expect(commonNameInput).toBeInTheDocument();
  expect(commonNameInput.value).toBe('');
  fireEvent.change(commonNameInput, { target: { value: 'test-root-ca' } });
  expect(commonNameInput.value).toBe('test-root-ca');

  const algoDropdown = screen.getByText('RSA');
  expect(algoDropdown).toBeInTheDocument();

  expect(screen.getByText('RSA options')).toBeInTheDocument();
  expect(screen.getByText('Key size')).toBeInTheDocument();

  const passwordInput = screen.getByPlaceholderText(/Private key password/) as HTMLInputElement;
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput.value).toBe('');
  fireEvent.change(passwordInput, { target: { value: 'super-secret-password' } });
  expect(passwordInput.value).toBe('super-secret-password');

  const typeDropdown = screen.getByPlaceholderText(/Certificate type/) as HTMLInputElement;
  expect(typeDropdown).toBeInTheDocument();
  await act(async () => userEvent.click(typeDropdown));

  expect(screen.queryByText('We recommend a key size of 8192 bits for a Root CA')).toBeFalsy();
  await act(async () => {
    fireEvent.change(typeDropdown, { target: { value: 'ROOT_CA' } });
  });
  expect(screen.getByText('We recommend a key size of 8192 bits for a Root CA')).toBeInTheDocument();

  const keySizeDropdown = screen.getByPlaceholderText('RSA key bits') as HTMLInputElement;
  expect(keySizeDropdown).toBeInTheDocument();
  await act(async () => userEvent.click(keySizeDropdown));
  await act(async () => {
    fireEvent.change(keySizeDropdown, { target: { value: '8192' } });
  });
  expect(screen.queryByText('We recommend a key size of 8192 bits for a Root CA')).toBeFalsy();

  const createButton = screen.getByText(/Create certificate/);
  expect(createButton).toBeInTheDocument();

  userEvent.click(createButton);

  await wait(
    () => {
      const { selected } = store.getState().certificates;
      expect(selected).toBe(cert);
      expect(window.location.pathname).toBe(`/certificates/${cert.id}`);
    },
    { timeout: 1 },
  );
});

test('new certificate: test required fields', async () => {
  mockRequests({
    '/api/v1/certificate-options': {
      body: opts,
      metadata: {
        method: 'GET',
        requestId: 'get-certificate-options-request-id',
        status: 200,
        url: '/api/v1/certificate-options',
      },
    },
  });

  await act(async () => render(<NewCertificateContainer />));

  await wait(
    () => {
      expect(screen.getByText(/Create new certificate/)).toBeInTheDocument();

      // Check that required warning texts ARE NOT displayed.
      expect(screen.queryByText(/Certificate name is required/)).toBeFalsy();
      expect(screen.queryByText(/Certificate type is required/)).toBeFalsy();
      expect(screen.queryByText(/Signature algorithm is required/)).toBeFalsy();
      expect(screen.queryByText(/Subject common name is required/)).toBeFalsy();
      expect(screen.queryByText(/At least 16 charactes are required in password/)).toBeFalsy();
    },
    { timeout: 1000 },
  );

  await wait(
    () => {
      const createButton = screen.getByText(/Create certificate/);
      expect(createButton).toBeInTheDocument();

      fireEvent.click(createButton);

      // Check that required warning texts ARE displayed.
      expect(screen.queryByText(/Certificate name is required/)).toBeTruthy();
      expect(screen.queryByText(/Certificate type is required/)).toBeTruthy();
      expect(screen.queryByText(/Subject common name is required/)).toBeTruthy();
      expect(screen.queryByText(/At least 16 charactes are required in password/)).toBeTruthy();
      expect(screen.queryByText(/Key size is required/)).toBeTruthy();
    },
    { timeout: 1000 },
  );
});

test('new certificate: no data', async () => {
  store.dispatch(removeOptions());
  mockRequests({});

  render(<NewCertificateContainer />);
  expect(screen.getByText(/Create new certificate/)).toBeInTheDocument();
});
