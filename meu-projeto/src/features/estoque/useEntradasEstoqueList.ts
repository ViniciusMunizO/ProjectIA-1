import { useCallback, useEffect, useState } from 'react';
import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';
import { ApiRequestError } from '../../lib/api-client';
import { listEntradasEstoque } from '../../lib/estoque-api';

export const useEntradasEstoqueList = () => {
  const [entradas, setEntradas] = useState<readonly NotaEntrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntradas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listEntradasEstoque();
      setEntradas(response.notas);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar as entradas de estoque');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEntradas();
  }, [fetchEntradas]);

  return { entradas, isLoading, error, refresh: fetchEntradas };
};
