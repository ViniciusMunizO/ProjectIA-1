import { createContext } from 'react';
import type { LoginInput, SignupInput } from '../../../shared/src/schemas/auth.schemas';
import type { User } from '../../../shared/src/types/auth.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  readonly user: User | null;
  readonly status: AuthStatus;
  readonly login: (input: LoginInput) => Promise<void>;
  readonly signup: (input: SignupInput) => Promise<void>;
  readonly logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
