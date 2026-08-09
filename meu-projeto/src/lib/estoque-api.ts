import type { NotaEntradaInput } from '../../../shared/src/schemas/entrada-estoque.schemas';
import type { NotaEntrada } from '../../../shared/src/types/entrada-estoque.types';
import { apiGet, apiPost } from './api-client';

export const createEntradaEstoque = (input: NotaEntradaInput): Promise<{ nota: NotaEntrada }> =>
  apiPost('/estoque/entradas', input);

export const listEntradasEstoque = (): Promise<{ notas: readonly NotaEntrada[] }> =>
  apiGet('/estoque/entradas');
