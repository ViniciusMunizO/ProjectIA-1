import { useCallback, useEffect, useState } from 'react';
import type { UpdateUserInput } from '../../../../shared/src/schemas/admin.schemas';
import type { AdminUserView, User } from '../../../../shared/src/types/auth.types';
import * as adminApi from '../../lib/admin-api';
import { ApiRequestError } from '../../lib/api-client';

export const useUsersAdmin = () => {
  const [users, setUsers] = useState<readonly (AdminUserView | User)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.listUsers();
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar os usuários');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const runAction = async (action: () => Promise<unknown>): Promise<boolean> => {
    setActionError(null);
    try {
      await action();
      await fetchUsers();
      return true;
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : 'Não foi possível concluir a ação');
      return false;
    }
  };

  const updateUser = (id: string, input: UpdateUserInput): Promise<boolean> =>
    runAction(() => adminApi.updateUser(id, input));

  const removeUser = (id: string): Promise<boolean> => runAction(() => adminApi.removeUser(id));

  return { users, isLoading, error, actionError, updateUser, removeUser };
};
