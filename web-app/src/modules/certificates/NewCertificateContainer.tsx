import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NewCertificate } from './components/NewCertificate';
import { getCertificatesOptions } from '../../state/certificates';
import { useCertificateOptions } from '../../state/hooks';
import { NewCertificateSkeleton } from './components/NewCertificateSkeleton';
import { CertificateRequest } from '../../types';
import log from '@czarsimon/remotelogger';

export function NewCertificateContainer() {
  const dispatch = useDispatch();
  const options = useCertificateOptions();
  useEffect(() => {
    dispatch(getCertificatesOptions());
  }, [dispatch]);

  const onRequest = (req: CertificateRequest) => {
    log.info(`CertificateRequest: ${JSON.stringify(req)}`)
  }

  return options ?
    <NewCertificate options={options} submit={onRequest} /> :
    <NewCertificateSkeleton />;
}
