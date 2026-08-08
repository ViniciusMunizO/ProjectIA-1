import type { ClienteInput } from '../../../../shared/src/schemas/cliente.schemas.js';
import type { Cliente } from '../../../../shared/src/types/cliente.types.js';
import { SupabaseQueryError } from '../../db/supabase.js';
import { AppError, conflict, notFound } from '../../lib/http-error.js';
import {
  insertCliente,
  listClientes,
  setClienteDocumentoPath,
  updateCliente as updateClienteRow,
} from './clientes.repository.js';
import { storeClienteDocumento, validateDocumento } from './documento-upload.service.js';

const POSTGRES_UNIQUE_VIOLATION = '23505';

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof SupabaseQueryError && err.code === POSTGRES_UNIQUE_VIOLATION;

export type CreateClienteResult = {
  readonly cliente: Cliente;
  readonly documentoUploadFailed: boolean;
};

export const createCliente = async (
  input: ClienteInput,
  createdBy: string,
  file: { readonly buffer: Buffer; readonly size: number } | null,
): Promise<CreateClienteResult> => {
  // Validated before any row is written: a rejected attachment must not
  // leave a half-created cliente behind.
  const documentoType = file ? validateDocumento(file) : null;

  let cliente: Cliente;
  try {
    cliente = await insertCliente(input, createdBy);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw conflict('Já existe um cliente cadastrado com este documento.');
    }
    throw err;
  }

  if (!file || !documentoType) {
    return { cliente, documentoUploadFailed: false };
  }

  try {
    const path = await storeClienteDocumento(cliente.id, file.buffer, documentoType);
    await setClienteDocumentoPath(cliente.id, path);
    return { cliente: { ...cliente, temDocumentoAnexado: true }, documentoUploadFailed: false };
  } catch (err) {
    if (err instanceof AppError) {
      return { cliente, documentoUploadFailed: true };
    }
    throw err;
  }
};

export const listAllClientes = (): Promise<Cliente[]> => listClientes();

// Open to any assigned role (gated at the route by requireRole(USER_ROLES),
// same as create/list). Does not touch the attached document — re-uploading
// a replacement file is not part of this edit flow.
export const updateCliente = async (id: string, input: ClienteInput, updatedBy: string): Promise<Cliente> => {
  let cliente: Cliente | null;
  try {
    cliente = await updateClienteRow(id, input, updatedBy);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw conflict('Já existe um cliente cadastrado com este documento.');
    }
    throw err;
  }

  if (!cliente) {
    throw notFound('Cliente não encontrado');
  }
  return cliente;
};
