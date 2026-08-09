import { useCallback, useEffect, useState } from 'react';
import type { Pedido } from '../../../../shared/src/types/pedido.types';
import { ApiRequestError } from '../../lib/api-client';
import { listPedidos } from '../../lib/pedidos-api';

export const usePedidosList = () => {
  const [pedidos, setPedidos] = useState<readonly Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listPedidos();
      setPedidos(response.pedidos);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar os pedidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPedidos();
  }, [fetchPedidos]);

  return { pedidos, isLoading, error, refresh: fetchPedidos };
};
