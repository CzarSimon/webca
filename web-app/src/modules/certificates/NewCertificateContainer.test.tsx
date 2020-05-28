import React from 'react';
import { act, wait, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../testutils';
import { CertificateOptions } from '../../types';
import { NewCertificateContainer } from './NewCertificateContainer';
import { mockRequests } from '../../api/httpclient';
import { removeOptions } from '../../state/certificates';
import { store } from '../../state';

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

  const algoDropdown = screen.getByText(/RSA/);
  expect(algoDropdown).toBeInTheDocument();

  const passwordInput = screen.getByPlaceholderText(/Private key password/) as HTMLInputElement;
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput.value).toBe('');
  fireEvent.change(passwordInput, { target: { value: 'super-secret-password' } });
  expect(passwordInput.value).toBe('super-secret-password');

  const typeDropdown = screen.getByText(/Certificate type/) as HTMLInputElement;
  expect(typeDropdown).toBeInTheDocument();
  await act(async () => userEvent.click(typeDropdown));
  expect(screen.queryByText(/Root CA/)).toBeTruthy();
  expect(screen.queryByText(/Intermediate CA/)).toBeTruthy();

  userEvent.selectOptions(typeDropdown, 'Root CA');

  const createButton = screen.getByText(/Create certificate/);
  expect(createButton).toBeInTheDocument();
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
