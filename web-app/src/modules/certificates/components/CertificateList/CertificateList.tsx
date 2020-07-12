import React from 'react';
import { Certificates, Certificate } from '../../../../types';
import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { useFormatedMessage } from '../../../../translations';
import { CertificateListTitle } from './CertificateListTitle';

import styles from './CertificateList.module.css';

interface Props extends Certificates {
  select: (id: string) => void;
  createNew: () => void;
}

function useColumns(): ColumnProps<Certificate>[] {
  const formatedMessage = useFormatedMessage();
  return [
    {
      title: formatedMessage('certificateList.name-column'),
      dataIndex: 'name',
    },
    {
      title: formatedMessage('certificateList.type-column'),
      dataIndex: 'type',
      render: (type) => formatedMessage(`certificate.type-${type}`),
    },
    {
      title: formatedMessage('certificateList.createdAt-column'),
      sorter: true,
      dataIndex: 'createdAt',
    },
    {
      title: formatedMessage('certificateList.expiresAt-column'),
      sorter: true,
      dataIndex: 'expiresAt',
    },
  ];
}

export function CertificateList({ items, loaded, select, createNew }: Props) {
  const columns = useColumns();
  const certificates: Certificate[] = items ? items.results : [];

  const onRow = (cert: Certificate) => ({
    onClick: () => select(cert.id),
  });

  return (
    <div className={styles.CertificateList}>
      <Table
        onRow={onRow}
        columns={columns}
        dataSource={certificates}
        rowKey={(cert) => cert.id}
        loading={!loaded}
        pagination={{ style: { margin: '16px' } }}
        title={() => <CertificateListTitle createNew={createNew} />}
      />
    </div>
  );
}
