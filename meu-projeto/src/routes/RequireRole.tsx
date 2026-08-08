import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import type { UserRole } from '../../../shared/src/types/auth.types';
import { useAuth } from '../hooks/useAuth';

type RequireRoleProps = {
  readonly roles: readonly UserRole[];
  readonly children: ReactNode;
};

// Assumes it renders under ProtectedRoute (status is already 'authenticated'
// by the time this mounts): this only narrows by role, same split as the
// server's requireAuth/requireRole pair.
export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { user } = useAuth();

  if (!user?.role || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
