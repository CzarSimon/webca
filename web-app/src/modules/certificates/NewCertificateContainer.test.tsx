import React from 'react';
import { NewCertificateContainer } from './NewCertificateContainer';
import { render, wait } from '../../testutils';
import { mockRequests } from '../../api/httpclient';
import { store } from '../../state';
import { CertificateOptions } from '../../types';
import { removeOptions } from '../../state/certificates';

const opts: CertificateOptions = {
  types: [
    {
      name: "ROOT_CA",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    },
    {
      name: "INTERMEDIATE_CA",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    },
    {
      name: "CERTIFICATE",
      active: true,
      createdAt: "2020-05-16 08:30:20",
      updatedAt: "2020-05-16 08:30:20",
    }
  ],
  algorithms: ["RSA"],
  formats: ["PEM"],
}

test('new certificate: renders form', async () => {
  mockRequests({
    "/api/v1/certificate-options": {
      body: opts,
      metadata: {
        method: "GET",
        requestId: "signup-request-id",
        status: 200,
        url: '/api/v1/certificate-options',
      }
    }
  });

  const r = render(<NewCertificateContainer />);

  await wait(() => {
    const state = store.getState();
    expect(state.certificates.options).toBe(opts);

    expect(r.getByText(/Create new certificate/)).toBeInTheDocument();

    const nameInput = r.getByPlaceholderText(/Name/);
    expect(nameInput).toBeInTheDocument();

    expect(r.getByText(/Subject/)).toBeInTheDocument();

    const commonNameInput = r.getByPlaceholderText(/Common name/);
    expect(commonNameInput).toBeInTheDocument();

    const createButton = r.getByText(/Create certificate/);
    expect(createButton).toBeInTheDocument();

    const typeDropdown = r.getByText(/Certificate type/);
    expect(typeDropdown).toBeInTheDocument();

    const algoDropdown = r.getByText(/RSA/);
    expect(algoDropdown).toBeInTheDocument();
  }, { timeout: 1000 })
});

test('new certificate: no data', async () => {
  store.dispatch(removeOptions());
  mockRequests({});

  const r = render(<NewCertificateContainer />);
  expect(r.getByText(/Create new certificate/)).toBeInTheDocument();
});
