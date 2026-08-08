import { useCallback, useEffect, useState } from 'react';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { ApiRequestError } from '../../lib/api-client';
import { listFornecedores } from '../../lib/fornecedores-api';

export const useFornecedoresList = () => {
  const [fornecedores, setFornecedores] = useState<readonly Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFornecedores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listFornecedores();
      setFornecedores(response.fornecedores);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar os fornecedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFornecedores();
  }, [fetchFornecedores]);

  const replaceFornecedor = (fornecedor: Fornecedor): void =>
    setFornecedores((current) => current.map((f) => (f.id === fornecedor.id ? fornecedor : f)));

  return { fornecedores, isLoading, error, replaceFornecedor, refresh: fetchFornecedores };
};
