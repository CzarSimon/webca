import React from 'react';
import { CertificateListContainer } from './CertificateListContainer';
import { render, act } from '../../testutils';
import { mockRequests } from '../../api/httpclient';
import { store } from '../../state';
import { CertificatePage, User } from '../../types';
import { addUser } from '../../state/user/actions';

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
      createdAt: 'some-date',
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
      createdAt: 'some-other-date',
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

test('new certificate: renders form', async () => {
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

  // let r: ReturnType<typeof render>;
  await act(async () => {
    render(<CertificateListContainer />);
  });
});
