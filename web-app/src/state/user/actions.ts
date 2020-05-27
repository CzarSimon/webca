import { createAction } from 'typesafe-actions';
import { User } from '../../types';

export const ADD_USER = '@webca/user/ADD_USER';
export const REMOVE_USER = '@webca/user/REMOVE_USER';

export const addUser = createAction(ADD_USER)<User>();
export const removeUser = createAction(REMOVE_USER)<void>();
