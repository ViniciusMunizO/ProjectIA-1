import { randomUUID } from 'node:crypto';
import { db } from '../../db/client.js';
import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types.js';

type CadastroRow = {
  id: string;
  user_id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  created_at: string;
};

const toCadastroRecord = (row: CadastroRow): CadastroRecord => ({
  id: row.id,
  userId: row.user_id,
  nome: row.nome,
  cpf: row.cpf,
  email: row.email,
  telefone: row.telefone,
  createdAt: row.created_at,
});

const insertCadastroStmt = db.prepare(
  'INSERT INTO cadastros (id, user_id, nome, cpf, email, telefone) VALUES (?, ?, ?, ?, ?, ?)',
);
const listCadastrosByUserStmt = db.prepare(
  'SELECT * FROM cadastros WHERE user_id = ? ORDER BY created_at DESC',
);

export const insertCadastro = (
  userId: string,
  nome: string,
  cpf: string,
  email: string,
  telefone: string,
): CadastroRecord => {
  const id = randomUUID();
  insertCadastroStmt.run(id, userId, nome, cpf, email, telefone);
  return { id, userId, nome, cpf, email, telefone, createdAt: new Date().toISOString() };
};

export const listCadastrosByUser = (userId: string): CadastroRecord[] => {
  const rows = listCadastrosByUserStmt.all(userId) as CadastroRow[];
  return rows.map(toCadastroRecord);
};
