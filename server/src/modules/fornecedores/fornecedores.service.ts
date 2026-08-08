import type { FornecedorInput } from '../../../../shared/src/schemas/fornecedor.schemas.js';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types.js';
import { SupabaseQueryError } from '../../db/supabase.js';
import { conflict, notFound } from '../../lib/http-error.js';
import { insertFornecedor, listFornecedores, updateFornecedor as updateFornecedorRow } from './fornecedores.repository.js';

const POSTGRES_UNIQUE_VIOLATION = '23505';

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof SupabaseQueryError && err.code === POSTGRES_UNIQUE_VIOLATION;

export const createFornecedor = async (input: FornecedorInput, createdBy: string): Promise<Fornecedor> => {
  try {
    return await insertFornecedor(input, createdBy);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw conflict('Já existe um fornecedor cadastrado com este CNPJ.');
    }
    throw err;
  }
};

export const listAllFornecedores = (): Promise<Fornecedor[]> => listFornecedores();

// Open to any assigned role (gated at the route by requireRole(USER_ROLES)),
// same as clientes/produtos.
export const updateFornecedor = async (
  id: string,
  input: FornecedorInput,
  updatedBy: string,
): Promise<Fornecedor> => {
  let fornecedor: Fornecedor | null;
  try {
    fornecedor = await updateFornecedorRow(id, input, updatedBy);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw conflict('Já existe um fornecedor cadastrado com este CNPJ.');
    }
    throw err;
  }

  if (!fornecedor) {
    throw notFound('Fornecedor não encontrado');
  }
  return fornecedor;
};
