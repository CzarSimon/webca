import React from 'react';
import { CertificateDisplay } from './components/CertificateDisplay';
import { useSelectedCertificate } from '../../state/hooks';

export function CertificateContainer() {
  const certificate = useSelectedCertificate();

  return <CertificateDisplay loading={!certificate} {...certificate} />;
}
