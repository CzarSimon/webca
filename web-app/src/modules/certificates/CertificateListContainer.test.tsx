import React from 'react';
import { CertificateListContainer } from './CertificateListContainer';
import { render, wait, fireEvent, act } from '../../testutils';
import { mockRequests } from '../../api/httpclient';
import { store } from '../../state';
import { CertificateOptions } from '../../types';

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
    "/api/v1/certificates": {
      body: opts,
      metadata: {
        method: "GET",
        requestId: "get-certificates-request-id",
        status: 200,
        url: '/api/v1/certificates',
      }
    }
  });

  let r: ReturnType<typeof render>;
  await act(async () => {
    r = render(<CertificateListContainer />);
  });
});
