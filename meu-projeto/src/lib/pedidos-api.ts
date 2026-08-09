import type { PedidoInput } from '../../../shared/src/schemas/pedido.schemas';
import type { Pedido } from '../../../shared/src/types/pedido.types';
import { apiGet, apiPost } from './api-client';

export const createPedido = (input: PedidoInput): Promise<{ pedido: Pedido }> => apiPost('/pedidos', input);

export const listPedidos = (): Promise<{ pedidos: readonly Pedido[] }> => apiGet('/pedidos');
