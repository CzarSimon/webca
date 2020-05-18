import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NewCertificate } from './components/NewCertificate';
import { getCertificatesOptions } from '../../state/certificates';
import { useCertificateOptions } from '../../state/hooks';
import { NewCertificateSkeleton } from './components/NewCertificateSkeleton';

export function NewCertificateContainer() {
  const dispatch = useDispatch();
  const options = useCertificateOptions();
  useEffect(() => {
    dispatch(getCertificatesOptions());
  }, [dispatch]);

  console.log(options);

  return options ?
    <NewCertificate options={options} /> :
    <NewCertificateSkeleton />;
}
