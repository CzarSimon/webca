import React from 'react';
import { act, fireEvent, render, wait } from '../../testutils';
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

  let r: ReturnType<typeof render>;
  await act(async () => {
    r = render(<NewCertificateContainer />);
  });

  await wait(
    () => {
      const state = store.getState();
      expect(state.certificates.options).toBe(opts);

      expect(r.getByText(/Create new certificate/)).toBeInTheDocument();
    },
    { timeout: 1000 },
  );

  const nameInput = r.getByPlaceholderText(/Name/);
  expect(nameInput).toBeInTheDocument();
  expect(nameInput.value).toBe('');
  fireEvent.change(nameInput, { target: { value: 'test-root-ca' } });
  expect(nameInput.value).toBe('test-root-ca');

  expect(r.getByText(/Subject/)).toBeInTheDocument();

  const commonNameInput = r.getByPlaceholderText(/Common name/);
  expect(commonNameInput).toBeInTheDocument();
  expect(commonNameInput.value).toBe('');
  fireEvent.change(commonNameInput, { target: { value: 'test-root-ca' } });
  expect(commonNameInput.value).toBe('test-root-ca');

  const algoDropdown = r.getByText(/RSA/);
  expect(algoDropdown).toBeInTheDocument();

  const passwordInput = r.getByPlaceholderText(/Private key password/);
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput.value).toBe('');
  fireEvent.change(passwordInput, { target: { value: 'super-secret-password' } });
  expect(passwordInput.value).toBe('super-secret-password');

  const typeDropdown = r.getByText(/Certificate type/);
  expect(typeDropdown).toBeInTheDocument();
  fireEvent.mouseDown(typeDropdown);
  expect(r.queryByText(/Root CA/)).toBeTruthy();
  expect(r.queryByText(/Intermediate CA/)).toBeTruthy();

  const createButton = r.getByText(/Create certificate/);
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

  let r: ReturnType<typeof render>;
  await act(async () => {
    r = render(<NewCertificateContainer />);
  });

  await wait(
    () => {
      expect(r.getByText(/Create new certificate/)).toBeInTheDocument();

      // Check that required warning texts ARE NOT displayed.
      expect(r.queryByText(/Certificate name is required/)).toBeFalsy();
      expect(r.queryByText(/Certificate type is required/)).toBeFalsy();
      expect(r.queryByText(/Signature algorithm is required/)).toBeFalsy();
      expect(r.queryByText(/Subject common name is required/)).toBeFalsy();
      expect(r.queryByText(/At least 16 charactes are required in password/)).toBeFalsy();
    },
    { timeout: 1000 },
  );

  await wait(
    () => {
      const createButton = r.getByText(/Create certificate/);
      expect(createButton).toBeInTheDocument();

      fireEvent.click(createButton);

      // Check that required warning texts ARE displayed.
      expect(r.queryByText(/Certificate name is required/)).toBeTruthy();
      expect(r.queryByText(/Certificate type is required/)).toBeTruthy();
      expect(r.queryByText(/Subject common name is required/)).toBeTruthy();
      expect(r.queryByText(/At least 16 charactes are required in password/)).toBeTruthy();
    },
    { timeout: 1000 },
  );
});

test('new certificate: no data', async () => {
  store.dispatch(removeOptions());
  mockRequests({});

  const r = render(<NewCertificateContainer />);
  expect(r.getByText(/Create new certificate/)).toBeInTheDocument();
});
