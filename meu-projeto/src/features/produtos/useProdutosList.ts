import { useCallback, useEffect, useState } from 'react';
import type { Produto } from '../../../../shared/src/types/produto.types';
import { ApiRequestError } from '../../lib/api-client';
import { listProdutos, setProdutoAuditado } from '../../lib/produtos-api';

export const useProdutosList = () => {
  const [produtos, setProdutos] = useState<readonly Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchProdutos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listProdutos();
      setProdutos(response.produtos);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar os produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = (produto: Produto): void => setProdutos((current) => [produto, ...current]);

  const replaceProduto = (produto: Produto): void =>
    setProdutos((current) => current.map((p) => (p.id === produto.id ? produto : p)));

  const toggleAuditado = async (id: string, auditado: boolean): Promise<boolean> => {
    setActionError(null);
    try {
      await setProdutoAuditado(id, auditado);
      setProdutos((current) => current.map((p) => (p.id === id ? { ...p, auditado } : p)));
      return true;
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : 'Não foi possível atualizar a auditoria');
      return false;
    }
  };

  return {
    produtos,
    isLoading,
    error,
    actionError,
    addProduto,
    replaceProduto,
    toggleAuditado,
    refresh: fetchProdutos,
  };
};
