import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { NewCertificate, NewCertificateSkeleton } from './components/NewCertificate';
import { getCertificateOptions, createCertificate } from '../../state/certificates';
import { useCertificateOptions } from '../../state/hooks';
import { CertificateRequest } from '../../types';

export function NewCertificateContainer() {
  const dispatch = useDispatch();
  const options = useCertificateOptions();
  useEffect(() => {
    dispatch(getCertificateOptions());
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
