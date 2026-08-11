import type { UpdateUserInput } from '../../../shared/src/schemas/admin.schemas';
import type { AdminUserView, User } from '../../../shared/src/types/auth.types';
import { apiDelete, apiGet, apiPatch } from './api-client';

export const listUsers = (): Promise<{ users: readonly (AdminUserView | User)[] }> =>
  apiGet('/admin/users');

export const updateUser = (id: string, input: UpdateUserInput): Promise<{ ok: true }> =>
  apiPatch(`/admin/users/${id}`, input);

export const removeUser = (id: string): Promise<{ ok: true }> => apiDelete(`/admin/users/${id}`);
