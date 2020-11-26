import React from 'react';
import { useHistory } from 'react-router-dom';
import { UserManagement } from './components/UserManagement';

export function UserManagementContainer() {
  const history = useHistory();

  const createNewInvitation = () => {
    history.push('/invitations/add');
  };

  return (
    <div>
      <UserManagement users={[]} createNewInvitation={createNewInvitation} />
    </div>
  );
}
