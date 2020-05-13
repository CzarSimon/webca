// Utility types

export interface TypedMap<T> {
  [key: string]: T
}

export type Optional<T> = (T | undefined);

export interface StatusBody {
  status: string;
}

// Client

export interface Client {
  id: string;
  sessionId: string;
}
