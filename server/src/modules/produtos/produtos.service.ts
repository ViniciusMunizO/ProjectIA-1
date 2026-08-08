import type { ProdutoInput } from '../../../../shared/src/schemas/produto.schemas.js';
import type { User } from '../../../../shared/src/types/auth.types.js';
import type { Produto } from '../../../../shared/src/types/produto.types.js';
import { forbidden, notFound } from '../../lib/http-error.js';
import {
  findProdutoById,
  insertProduto,
  listProdutos,
  setProdutoAuditado,
  updateProduto as updateProdutoRow,
} from './produtos.repository.js';

const CAN_AUDIT_ROLES = new Set(['ADMIN', 'FARMACEUTICO']);

// A product is always created unaudited: marking it audited is a deliberate
// review step, reserved for ADMIN/FARMACEUTICO, done after the fact (see
// setAuditado below). Nothing in the create payload can set it directly,
// so there is no client-supplied value to distrust here in the first place.
export const createProduto = (input: ProdutoInput, createdBy: string): Promise<Produto> =>
  insertProduto(input, createdBy);

export const listAllProdutos = (): Promise<Produto[]> => listProdutos();

// Open to any assigned role (gated at the route by requireRole(USER_ROLES),
// same as create/list): editing the general data is not the same
// restricted action as flipping auditado, which stays ADMIN/FARMACEUTICO
// only via setAuditado below.
export const updateProduto = async (id: string, input: ProdutoInput, updatedBy: string): Promise<Produto> => {
  const produto = await updateProdutoRow(id, input, updatedBy);
  if (!produto) {
    throw notFound('Produto não encontrado');
  }
  return produto;
};

export const setAuditado = async (actor: User, produtoId: string, auditado: boolean): Promise<void> => {
  if (!actor.role || !CAN_AUDIT_ROLES.has(actor.role)) {
    throw forbidden('Apenas ADMIN ou FARMACEUTICO podem alterar a auditoria do produto.');
  }

  const produto = await findProdutoById(produtoId);
  if (!produto) {
    throw notFound('Produto não encontrado');
  }

  await setProdutoAuditado(produtoId, auditado, actor.id);
};
