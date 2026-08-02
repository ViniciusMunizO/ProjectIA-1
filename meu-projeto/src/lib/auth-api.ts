import type { LoginInput, SignupInput } from '../../../shared/src/schemas/auth.schemas';
import type { User } from '../../../shared/src/types/auth.types';
import { apiGet, apiPost } from './api-client';

export const signup = (input: SignupInput): Promise<{ user: User }> =>
  apiPost('/auth/signup', input);

export const login = (input: LoginInput): Promise<{ user: User }> => apiPost('/auth/login', input);

export const logout = (): Promise<{ ok: true }> => apiPost('/auth/logout', {});

export const me = (): Promise<{ user: User | null }> => apiGet('/auth/me');
