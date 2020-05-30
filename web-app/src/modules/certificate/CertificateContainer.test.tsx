import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { CertificateContainer } from './CertificateContainer';
import { Certificate } from '../../types';
import { store } from '../../state';

/*
beforeEach(() => {
  store.dispatch()
});
*/

const cert: Certificate = {
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

test('certificate page: renders certificate', async () => {
  await act(async () => {
    render(<CertificateContainer />);
  });

  const downloadButton = screen.getByRole('button', { name: /download certificate/i });
  expect(downloadButton).toBeInTheDocument();
});
