import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { LoginInput, SignupInput } from '../../../shared/src/schemas/auth.schemas';
import type { User } from '../../../shared/src/types/auth.types';
import * as authApi from '../lib/auth-api';
import { AuthContext, type AuthStatus } from './AuthContext';

type AuthProviderProps = {
  readonly children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setUser(response.user);
        setStatus(response.user ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await authApi.login(input);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const response = await authApi.signup(input);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
