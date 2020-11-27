import { httpclient } from './httpclient';
import { Invitation, InvitationCreationRequest } from '../types';
import { HTTPResponse } from '@czarsimon/httpclient';

const INVITATIONS_URL = '/api/v1/invitations';

export const createInvitation = (req: InvitationCreationRequest): Promise<HTTPResponse<Invitation>> =>
  httpclient.post<Invitation>({ url: INVITATIONS_URL, body: req });

export const getInvitation = (id: string): Promise<HTTPResponse<Invitation>> =>
  httpclient.get<Invitation>({ url: `${INVITATIONS_URL}/${id}` });
