import React, { useState } from 'react';
import { useFetchSignatories } from '../../../../state/hooks';
import { Certificate, Optional, Signatory } from '../../../../types';
import { AutoComplete, Input } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useFormatedMessage } from '../../../../translations';

import styles from './SignatorySearch.module.css';

interface Props {
  setSignatory: (signatory: Signatory) => void;
}

interface Option {
  value: string;
}

export function SignatorySearch({ setSignatory }: Props) {
  const [id, setId] = useState<Optional<string>>(undefined);
  const [password, setPassword] = useState<Optional<string>>(undefined);
  const [open, setOpen] = useState<boolean>(true);
  const signatories = useFetchSignatories();
  const formattedMessage = useFormatedMessage();

  const onSelect = (value: string) => {
    const newId = findId(value, signatories);
    setId(newId);
    setOpen(false);
    if (newId && password) {
      setSignatory({ id: newId, password });
    }
  };

  const onTypePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (id) {
      setSignatory({ id, password: e.target.value });
    }
  };

  return (
    <div className={styles.SignatorySearch}>
      <h3>
        <FormattedMessage id="signatorySearch.title" />
      </h3>
      <AutoComplete
        open={open}
        autoFocus={true}
        filterOption={true}
        onSelect={onSelect}
        style={{ width: '100%', marginBottom: '24px' }}
        onFocus={() => setOpen(true)}
        onChange={() => setOpen(true)}
        options={mapCertificatesToOptions(signatories)}
      >
        <Input.Search size="large" placeholder={formattedMessage('signatorySearch.search-placeholder')} />
      </AutoComplete>
      {id && (
        <Input.Password
          size="large"
          placeholder={formattedMessage('signatorySearch.password-placeholder')}
          onChange={onTypePassword}
        />
      )}
    </div>
  );
}

function mapCertificatesToOptions(certs: Certificate[]): Option[] {
  return certs.map((cert) => ({ value: cert.name }));
}

function findId(name: string, certs: Certificate[]): Optional<string> {
  for (const cert of certs) {
    if (cert.name === name) {
      return cert.id;
    }
  }

  return undefined;
}
