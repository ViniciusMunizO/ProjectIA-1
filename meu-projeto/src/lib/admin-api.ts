import type { UpdateUserInput } from '../../../shared/src/schemas/admin.schemas';
import type { AdminUserView, User } from '../../../shared/src/types/auth.types';
import { apiDelete, apiGet, apiPatch, apiPost } from './api-client';

type SignupKeyResponse = {
  readonly key: string;
  readonly expiresAt: string;
};

export const getSignupKey = (): Promise<SignupKeyResponse> => apiGet('/admin/signup-key');

export const rotateSignupKey = (): Promise<SignupKeyResponse> => apiPost('/admin/signup-key/rotate', {});

export const listUsers = (): Promise<{ users: readonly (AdminUserView | User)[] }> =>
  apiGet('/admin/users');

export const updateUser = (id: string, input: UpdateUserInput): Promise<{ ok: true }> =>
  apiPatch(`/admin/users/${id}`, input);

export const removeUser = (id: string): Promise<{ ok: true }> => apiDelete(`/admin/users/${id}`);
