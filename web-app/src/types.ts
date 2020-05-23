import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux';

// Redux types.
export type Thunk<T = void> = ThunkAction<Promise<T>, {}, {}, AnyAction>;
export type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
export type successCallback = (success: boolean) => void

// State types
export interface UserState {
  user?: User;
  loaded: boolean;
};

export interface CertificateState {
  certificates: Certificate[];
  selected?: Certificate;
  options?: CertificateOptions;
}

// Account types
export interface AuthenticationRequest {
  accountName: string;
  email: string;
  password: string;
};

export interface AuthenticationResponse {
  token: string;
  user: User;
};

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  account: Account;
};

export interface Account {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// Certificate types
export interface Certificate {
  id: string;
  name: string;
  body: string;
  subject: CertificateSubject;
  format: string;
  type: string;
  signatoryId?: string;
  accountId: string;
  createdAt: string;
};

export interface CertificateSubject {
  commonName: string;
  country?: string;
  state?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  email?: string;
};

export interface CertificateOptions {
  types: CertificateType[];
  algorithms: string[];
  formats: string[];
};

export interface CertificateType {
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface CertificateRequest {
  name: string;
  subject: CertificateSubject;
  type: string;
  algorithm: string;
  signatoryId?: string;
  password: string;
  options: TypedMap<any>;
};

// Utility types

export type TypedMap<T> = Record<string, T>;

export type TextMap = TypedMap<string>;

export type Optional<T> = (T | undefined);

export interface StatusBody {
  status: string;
}

// Client

export interface Client {
  id: string;
  sessionId: string;
}
