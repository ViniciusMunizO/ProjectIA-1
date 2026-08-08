import { useCallback, useEffect, useState } from 'react';
import type { Cliente } from '../../../../shared/src/types/cliente.types';
import { listClientes } from '../../lib/clientes-api';
import { ApiRequestError } from '../../lib/api-client';

export const useClientesList = () => {
  const [clientes, setClientes] = useState<readonly Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listClientes();
      setClientes(response.clientes);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar os clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClientes();
  }, [fetchClientes]);

  const addCliente = (cliente: Cliente): void => setClientes((current) => [cliente, ...current]);

  const replaceCliente = (cliente: Cliente): void =>
    setClientes((current) => current.map((c) => (c.id === cliente.id ? cliente : c)));

  return { clientes, isLoading, error, addCliente, replaceCliente, refresh: fetchClientes };
};
