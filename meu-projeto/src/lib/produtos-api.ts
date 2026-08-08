import type { ProdutoInput } from '../../../shared/src/schemas/produto.schemas';
import type { Produto } from '../../../shared/src/types/produto.types';
import { apiGet, apiPatch, apiPost } from './api-client';

export const createProduto = (input: ProdutoInput): Promise<{ produto: Produto }> =>
  apiPost('/produtos', input);

export const listProdutos = (): Promise<{ produtos: readonly Produto[] }> => apiGet('/produtos');

export const updateProduto = (id: string, input: ProdutoInput): Promise<{ produto: Produto }> =>
  apiPatch(`/produtos/${encodeURIComponent(id)}`, input);

export const setProdutoAuditado = (id: string, auditado: boolean): Promise<{ ok: true }> =>
  apiPatch(`/produtos/${encodeURIComponent(id)}/auditado`, { auditado });
