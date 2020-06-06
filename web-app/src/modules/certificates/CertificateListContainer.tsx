import React from 'react';
import { CertificateList } from './components/CertificateList';
import { useFetchCertificates } from '../../state/hooks';
import { useHistory } from 'react-router-dom';

export function CertificateListContainer() {
  const certificates = useFetchCertificates();
  const history = useHistory();
  const selectCertificate = (id: string) => {
    history.push(`/certificates/${id}`);
  };

  const createNewCertificate = () => {
    history.push('/certificates/add');
  };

  return <CertificateList {...certificates} select={selectCertificate} createNew={createNewCertificate} />;
}
