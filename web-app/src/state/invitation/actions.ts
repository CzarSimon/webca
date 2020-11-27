import { createAction } from 'typesafe-actions';
import { Invitation } from '../../types';

export const ADD_INVITAION = '@webca/invitation/ADD_INVITAION';

export const addInvitation = createAction(ADD_INVITAION)<Invitation>();
