import React from 'react';
import { NewCertificateContainer } from './NewCertificateContainer';
import { render } from '../../testutils';

test('new certificate: renders form', () => {
  const r = render(<NewCertificateContainer />);
  const title = r.getByText(/Create new certificate/);
  expect(title).toBeInTheDocument();
});
