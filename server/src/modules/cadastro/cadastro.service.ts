import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types.js';
import { conflict } from '../../lib/http-error.js';
import { insertCadastro, listCadastrosByUser } from './cadastro.repository.js';

type SqliteError = Error & { readonly code?: string };

const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof Error && (err as SqliteError).code === 'SQLITE_CONSTRAINT_UNIQUE';

export const createCadastro = (
  userId: string,
  nome: string,
  cpf: string,
  email: string,
  telefone: string,
): CadastroRecord => {
  try {
    return insertCadastro(userId, nome, cpf, email, telefone);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw conflict('Este CPF já foi cadastrado');
    }
    throw err;
  }
};

export const listCadastros = (userId: string): CadastroRecord[] => listCadastrosByUser(userId);
