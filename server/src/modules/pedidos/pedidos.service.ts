import type { PedidoInput } from '../../../../shared/src/schemas/pedido.schemas.js';
import type { Pedido } from '../../../../shared/src/types/pedido.types.js';
import { AppError, notFound } from '../../lib/http-error.js';
import { findProdutosAuditadoStatus } from '../produtos/produtos.repository.js';
import { findPedidoById, insertPedido, listPedidos } from './pedidos.repository.js';

// Pre-checked here for a clear, per-product error message before ever
// calling the database function; fn_create_pedido re-checks the same rule
// itself (see the migration), since the database write is the real
// enforcement boundary and this call is a courtesy, not the guarantee.
const assertItensAuditados = async (produtoIds: readonly string[]): Promise<void> => {
  const status = await findProdutosAuditadoStatus(produtoIds);

  for (const id of new Set(produtoIds)) {
    const produto = status.get(id);
    if (!produto) {
      throw notFound('Produto não encontrado.');
    }
    if (!produto.auditado) {
      throw new AppError(400, `O produto "${produto.nome}" precisa estar auditado para ser usado em um pedido.`);
    }
  }
};

export const createPedido = async (input: PedidoInput, createdBy: string): Promise<Pedido> => {
  await assertItensAuditados(input.itens.map((item) => item.produtoId));

  const pedidoId = await insertPedido(
    {
      tipo: input.tipo,
      clienteId: input.clienteId,
      numeroPedido: input.numeroPedido,
      observacoes: input.observacoes,
      itens: input.itens,
    },
    createdBy,
  );

  const pedido = await findPedidoById(pedidoId);
  if (!pedido) {
    throw new AppError(500, 'O pedido foi criado, mas não foi possível carregá-lo.');
  }
  return pedido;
};

export const listAllPedidos = (): Promise<Pedido[]> => listPedidos();
