import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { NewCertificate } from './components/NewCertificate';
import { getCertificatesOptions, createCertificate } from '../../state/certificates';
import { useCertificateOptions } from '../../state/hooks';
import { NewCertificateSkeleton } from './components/NewCertificateSkeleton';
import { CertificateRequest } from '../../types';

export function NewCertificateContainer() {
  const dispatch = useDispatch();
  const options = useCertificateOptions();
  useEffect(() => {
    dispatch(getCertificatesOptions());
  }, [dispatch]);

  const history = useHistory();
  const onCreateSuccess = (success: boolean, id?: string) => {
    if (success) {
      history.push(`/certificates/${id}`);
    }
  };

  const onRequest = (req: CertificateRequest) => {
    dispatch(createCertificate(req, onCreateSuccess));
  };

  return options ?
    <NewCertificate options={options} submit={onRequest} /> :
    <NewCertificateSkeleton />;
};
