import React from 'react';
import { useIsAuthenticated } from '../state/hooks';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { UnauthenticatedRoutes } from './UnauthenticatedRoutes';

export function Routes() {
  const authenticated = useIsAuthenticated();
  return authenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
}
