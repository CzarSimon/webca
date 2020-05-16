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
