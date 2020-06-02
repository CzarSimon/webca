import React from 'react';
import { CertificateDisplay } from './components/CertificateDisplay';
import { useSelectedCertificate, useUserState } from '../../state/hooks';
import { ROLES } from '../../constants';
import { useDispatch } from 'react-redux';
import { downloadCertificateBody } from '../../state/certificates';

export function CertificateContainer() {
  const dispatch = useDispatch();
  const { user } = useUserState();
  const certificate = useSelectedCertificate();
  const isAdmin = user?.role === ROLES.ADMIN;
  const downloadCertificate = () => {
    if (!certificate) {
      return;
    }

    dispatch(downloadCertificateBody(certificate.id));
  };

  return (
    <CertificateDisplay
      isLoading={!certificate}
      certificate={certificate}
      isAdmin={isAdmin}
      downloadCertificate={downloadCertificate}
    />
  );
}
