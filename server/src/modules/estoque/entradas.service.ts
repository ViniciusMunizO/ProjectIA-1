import type { NotaEntradaInput } from '../../../../shared/src/schemas/entrada-estoque.schemas.js';
import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types.js';
import { AppError, notFound } from '../../lib/http-error.js';
import { findProdutosAuditadoStatus } from '../produtos/produtos.repository.js';
import { findEntradaEstoqueById, insertEntradaEstoque, listEntradasEstoque } from './entradas.repository.js';

// Pre-checked here for a clear, per-product error message before ever
// calling the database function; fn_create_entrada_estoque re-checks the
// same rule itself (see the migration), since the database write is the
// real enforcement boundary and this call is a courtesy, not the guarantee.
const assertItensAuditados = async (produtoIds: readonly string[]): Promise<void> => {
  const status = await findProdutosAuditadoStatus(produtoIds);

  for (const id of new Set(produtoIds)) {
    const produto = status.get(id);
    if (!produto) {
      throw notFound('Produto não encontrado.');
    }
    if (!produto.auditado) {
      throw new AppError(
        400,
        `O produto "${produto.nome}" precisa estar auditado para ser usado em uma entrada de estoque.`,
      );
    }
  }
};

export const createEntradaEstoque = async (input: NotaEntradaInput, createdBy: string): Promise<NotaEntrada> => {
  await assertItensAuditados(input.itens.map((item) => item.produtoId));

  const notaId = await insertEntradaEstoque(
    {
      fornecedorId: input.fornecedorId,
      valorFrete: input.valorFrete,
      desconto: input.desconto,
      itens: input.itens,
    },
    createdBy,
  );

  const nota = await findEntradaEstoqueById(notaId);
  if (!nota) {
    throw new AppError(500, 'A nota foi criada, mas não foi possível carregá-la.');
  }
  return nota;
};

export const listAllEntradasEstoque = (): Promise<NotaEntrada[]> => listEntradasEstoque();
