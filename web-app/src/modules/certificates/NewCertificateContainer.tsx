import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { NewCertificate, NewCertificateSkeleton } from './components/NewCertificate';
import { createCertificate } from '../../state/certificates';
import { useFetchCertificateOptions } from '../../state/hooks';
import { CertificateRequest } from '../../types';

export function NewCertificateContainer() {
  const dispatch = useDispatch();
  const options = useFetchCertificateOptions();
  const history = useHistory();

  const onCreateSuccess = (success: boolean, id?: string) => {
    if (success) {
      history.push(`/certificates/${id}`);
    }
  };

  const onRequest = (req: CertificateRequest) => {
    dispatch(createCertificate(req, onCreateSuccess));
  };

  return options ? <NewCertificate options={options} submit={onRequest} /> : <NewCertificateSkeleton />;
}
