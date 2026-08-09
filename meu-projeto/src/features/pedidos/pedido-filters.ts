import type { Pedido } from '../../../../shared/src/types/pedido.types';
import { stripAccents } from '../../../../shared/src/validators/text-normalize';

export type PedidoFilters = {
  readonly busca: string;
  readonly dataInicio: string;
  readonly dataFim: string;
};

export const EMPTY_PEDIDO_FILTERS: PedidoFilters = {
  busca: '',
  dataInicio: '',
  dataFim: '',
};

export const filterPedidos = (pedidos: readonly Pedido[], filters: PedidoFilters): Pedido[] => {
  let result = [...pedidos];

  if (filters.busca.trim()) {
    const needle = stripAccents(filters.busca.trim().toLowerCase());
    result = result.filter((pedido) => {
      const haystacks = [pedido.clienteNome, pedido.clienteDocumento, String(pedido.codigo), pedido.numeroPedido ?? ''];
      return haystacks.some((field) => stripAccents(field.toLowerCase()).includes(needle));
    });
  }

  // dataEmissao is an ISO "YYYY-MM-DD" string, so lexicographic comparison
  // sorts the same as chronological order — no Date parsing needed.
  if (filters.dataInicio) {
    result = result.filter((pedido) => pedido.dataEmissao >= filters.dataInicio);
  }
  if (filters.dataFim) {
    result = result.filter((pedido) => pedido.dataEmissao <= filters.dataFim);
  }

  return result;
};
