import { httpclient } from './httpclient';
import { AuthenticationRequest, AuthenticationResponse } from '../types';
import { HTTPResponse } from '@czarsimon/httpclient';

const SIGNUP_URL: string = '/api/v1/signup';
const LOGIN_URL: string = '/api/v1/login';

export const signup = (req: AuthenticationRequest): Promise<HTTPResponse<AuthenticationResponse>> =>
  httpclient.post<AuthenticationResponse>({ url: SIGNUP_URL, body: req });

export const login = (req: AuthenticationRequest): Promise<HTTPResponse<AuthenticationResponse>> =>
  httpclient.post<AuthenticationResponse>({ url: LOGIN_URL, body: req });
