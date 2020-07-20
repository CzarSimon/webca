import React from 'react';
import { CertificateDisplay } from './components/CertificateDisplay';
import { useSelectedCertificate, useUserState } from '../../state/hooks';
import { ROLES } from '../../constants';
import { useDispatch } from 'react-redux';
import { downloadCertificateBody, downloadCertificatePrivateKey } from '../../state/certificates';
import { successCallback } from '../../types';

export function CertificateContainer() {
  const dispatch = useDispatch();
  const { user } = useUserState();
  const { certificate } = useSelectedCertificate();
  const isAdmin = user?.role === ROLES.ADMIN;
  const downloadCertificate = () => {
    if (!certificate) {
      return;
    }

    dispatch(downloadCertificateBody(certificate.id));
  };

  const downloadPrivateKey = (password: string, callback: successCallback) => {
    if (!certificate) {
      return;
    }

    dispatch(downloadCertificatePrivateKey(certificate.id, password, callback));
  };

  return (
    <CertificateDisplay
      isLoading={!certificate}
      certificate={certificate}
      isAdmin={isAdmin}
      downloadCertificate={downloadCertificate}
      downloadPrivateKey={downloadPrivateKey}
    />
  );
}
