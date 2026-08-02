import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from './AuthLoadingScreen';

type PublicOnlyRouteProps = {
  readonly children: ReactNode;
};

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/cadastro" replace />;
  }

  return children;
};
