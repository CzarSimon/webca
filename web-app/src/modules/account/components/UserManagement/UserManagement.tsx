import React from 'react';
import { Table } from 'antd';
import { User } from '../../../../types';
import { ColumnProps } from 'antd/lib/table';
import { useFormatedMessage } from '../../../../translations';
import { DateTime } from '../../../../components/display/DateTime';
import { UserManagementTitle } from './UserManagementTitle';

interface Props {
  users: User[];
  createNewInvitation: () => void;
}

function useColumns(): ColumnProps<User>[] {
  const formatedMessage = useFormatedMessage();
  return [
    {
      title: formatedMessage('userManagement.email-column'),
      dataIndex: 'email',
    },
    {
      title: formatedMessage('userManagement.role-column'),
      dataIndex: 'role',
    },
    {
      title: formatedMessage('userManagement.createdAt-column'),
      dataIndex: 'createdAt',
      render: (_, cert) => <DateTime value={cert.createdAt} />, // eslint-disable-line
    },
  ];
}

export function UserManagement({ users, createNewInvitation }: Props) {
  const columns = useColumns();

  return (
    <div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(cert) => cert.id}
        pagination={{ style: { margin: '16px' } }}
        title={() => <UserManagementTitle createNewInvitation={createNewInvitation} />}
      />
    </div>
  );
}
