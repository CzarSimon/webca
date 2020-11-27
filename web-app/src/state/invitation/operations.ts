import { Thunk, Dispatch, Optional, successCallback, InvitationCreationRequest } from '../../types';
import * as api from '../../api';
import { ResponseMetadata } from '@czarsimon/httpclient';
import log from '@czarsimon/remotelogger';
import { addInvitation } from './actions';
import { logError, createApiError } from '../../utils/apiutil';
import { registerHTTPError } from '../error';

export function createInvitation(req: InvitationCreationRequest, callback: successCallback): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.createInvitation(req);
    if (!body) {
      handleCreateInvitationError(dispatch, req, error, metadata);
      callback(false);
      return;
    }

    const { id, role, createdById } = body;
    log.debug(`Successfully created invitation(id=${id}, role=${role}, createdById=${createdById})}`);
    callback(true);
  };
}

export function getInvitation(id: string): Thunk {
  return async (dispatch: Dispatch): Promise<void> => {
    const { body, error, metadata } = await api.getInvitation(id);
    if (!body) {
      handleGetInvitationError(dispatch, id, error, metadata);
      return;
    }

    log.debug(`Successfully retrieved invitation(id=${id}, accountId=${body.account.id})`);
    dispatch(addInvitation(body));
  };
}

function handleCreateInvitationError(
  dispatch: Dispatch,
  req: InvitationCreationRequest,
  error: Optional<Error>,
  metadata: ResponseMetadata,
) {
  logError('Failed to create invitation', error, metadata);
  dispatch(registerHTTPError('api.createInvitation', metadata, error || createApiError(metadata)));
}

function handleGetInvitationError(
  dispatch: Dispatch,
  invitationId: string,
  error: Optional<Error>,
  metadata: ResponseMetadata,
) {
  logError(`Failed to retrieve invitation(id=${invitationId}).`, error, metadata);
  dispatch(registerHTTPError('api.getInvitation', metadata, error || createApiError(metadata)));
}
