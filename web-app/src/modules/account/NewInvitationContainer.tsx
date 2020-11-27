import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createInvitation } from '../../state/invitation';
import { InvitationCreationRequest } from '../../types';
import { NewInvitation } from './components/NewInvitation';

export function NewInvitationContainer() {
  const dispatch = useDispatch();
  const history = useHistory();
  const onCreateSuccess = (success: boolean) => {
    if (success) {
      history.push('/account');
    }
  };

  const onRequest = (req: InvitationCreationRequest) => {
    dispatch(createInvitation(req, onCreateSuccess));
  };

  return <NewInvitation submit={onRequest} />;
}
