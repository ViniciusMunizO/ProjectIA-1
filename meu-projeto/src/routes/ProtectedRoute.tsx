import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from './AuthLoadingScreen';

type ProtectedRouteProps = {
  readonly children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
};
