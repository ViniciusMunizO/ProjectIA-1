import type { FornecedorInput } from '../../../shared/src/schemas/fornecedor.schemas';
import type { Fornecedor } from '../../../shared/src/types/fornecedor.types';
import type { CnpjLookupResult } from '../../../shared/src/types/cnpj-lookup.types';
import { apiGet, apiPatch, apiPost } from './api-client';

export const createFornecedor = (input: FornecedorInput): Promise<{ fornecedor: Fornecedor }> =>
  apiPost('/fornecedores', input);

export const listFornecedores = (): Promise<{ fornecedores: readonly Fornecedor[] }> =>
  apiGet('/fornecedores');

export const updateFornecedor = (id: string, input: FornecedorInput): Promise<{ fornecedor: Fornecedor }> =>
  apiPatch(`/fornecedores/${encodeURIComponent(id)}`, input);

export const lookupCnpjFornecedor = (cnpj: string): Promise<CnpjLookupResult> =>
  apiGet(`/fornecedores/cnpj/${encodeURIComponent(cnpj)}`);
