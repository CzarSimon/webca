import { createAction } from 'typesafe-actions';
import { ErrorInfo } from '../../types';

const ADD_ERROR = '@webca/error/ADD';
const REMOVE_ERROR = '@webca/error/REMOVE';

export const addError = createAction(ADD_ERROR)<ErrorInfo>();
export const removeError = createAction(REMOVE_ERROR)<void>();
