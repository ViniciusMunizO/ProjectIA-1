import type { ClienteInput } from '../../../shared/src/schemas/cliente.schemas';
import type { Cliente } from '../../../shared/src/types/cliente.types';
import type { CnpjLookupResult } from '../../../shared/src/types/cnpj-lookup.types';
import { apiGet, apiPatch, apiPostForm } from './api-client';

export type CreateClienteResult = {
  readonly cliente: Cliente;
  readonly documentoUploadFailed: boolean;
};

export const createCliente = (
  input: ClienteInput,
  arquivo: File | null,
): Promise<CreateClienteResult> => {
  const form = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) {
      form.set(key, String(value));
    }
  }
  // Distinct field name from the schema's own "documento" (the CPF/CNPJ
  // string) — same name would silently overwrite one with the other.
  if (arquivo) {
    form.set('arquivo', arquivo);
  }

  return apiPostForm('/clientes', form);
};

export const listClientes = (): Promise<{ clientes: readonly Cliente[] }> => apiGet('/clientes');

export const updateCliente = (id: string, input: ClienteInput): Promise<{ cliente: Cliente }> =>
  apiPatch(`/clientes/${encodeURIComponent(id)}`, input);

export const lookupCnpj = (cnpj: string): Promise<CnpjLookupResult> =>
  apiGet(`/clientes/cnpj/${encodeURIComponent(cnpj)}`);

export const getClienteDocumentoUrl = (id: string): Promise<{ url: string }> =>
  apiGet(`/clientes/${encodeURIComponent(id)}/documento`);
