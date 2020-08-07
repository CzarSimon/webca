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
  const selected = useSelectedCertificate();
  const { certificate } = selected;
  const isAdmin = user?.role === ROLES.ADMIN;

  const downloadCertificate = (fullchain: boolean) => {
    if (!certificate) {
      return;
    }

    dispatch(downloadCertificateBody(certificate.id, fullchain));
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
      selected={selected}
      isAdmin={isAdmin}
      downloadCertificate={() => downloadCertificate(false)}
      downloadCertificateChain={() => downloadCertificate(true)}
      downloadPrivateKey={downloadPrivateKey}
    />
  );
}
