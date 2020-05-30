import React from 'react';
import { CertificateDisplay } from './components/CertificateDisplay';
import { useSelectedCertificate, useUserState } from '../../state/hooks';
import { ROLES } from '../../constants';

export function CertificateContainer() {
  const { user } = useUserState();
  const certificate = useSelectedCertificate();
  const isAdmin = user?.role === ROLES.ADMIN;

  return <CertificateDisplay isLoading={!certificate} certificate={certificate} isAdmin={isAdmin} />;
}
