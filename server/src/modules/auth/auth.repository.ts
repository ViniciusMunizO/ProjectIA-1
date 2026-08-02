import { randomUUID } from 'node:crypto';
import { db } from '../../db/client.js';
import { env } from '../../config/env.js';
import { generateSessionToken } from '../../lib/session-token.js';
import type { User } from '../../../../shared/src/types/auth.types.js';

type UserRow = {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  created_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
};

export type SessionSummary = {
  readonly publicId: string;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  readonly current: boolean;
};

const toUser = (row: UserRow): User => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  createdAt: row.created_at,
});

const idleCutoff = (): string =>
  new Date(Date.now() - env.SESSION_IDLE_TIMEOUT_HOURS * 60 * 60 * 1000).toISOString();

const insertUserStmt = db.prepare(
  'INSERT INTO users (id, nome, email, password_hash) VALUES (?, ?, ?, ?)',
);
const findUserByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
const findUserByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');

const insertSessionStmt = db.prepare(
  'INSERT INTO sessions (id, public_id, user_id, expires_at) VALUES (?, ?, ?, ?)',
);
const findValidSessionStmt = db.prepare(
  `SELECT sessions.id, sessions.user_id, sessions.expires_at, users.id AS u_id, users.nome AS u_nome,
          users.email AS u_email, users.created_at AS u_created_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? AND sessions.expires_at > ? AND sessions.last_seen_at > ?`,
);
const touchSessionStmt = db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?');
const deleteSessionStmt = db.prepare('DELETE FROM sessions WHERE id = ?');
const deleteSessionForUserStmt = db.prepare(
  'DELETE FROM sessions WHERE public_id = ? AND user_id = ?',
);
const listSessionsForUserStmt = db.prepare(
  `SELECT public_id, created_at, last_seen_at, id FROM sessions
    WHERE user_id = ? AND expires_at > ? AND last_seen_at > ?
    ORDER BY last_seen_at DESC`,
);

export const createUser = (nome: string, email: string, passwordHash: string): User => {
  const id = randomUUID();
  insertUserStmt.run(id, nome, email, passwordHash);
  return { id, nome, email, createdAt: new Date().toISOString() };
};

export const findUserByEmail = (
  email: string,
): (User & { readonly passwordHash: string }) | null => {
  const row = findUserByEmailStmt.get(email) as UserRow | undefined;
  return row ? { ...toUser(row), passwordHash: row.password_hash } : null;
};

export const findUserById = (id: string): User | null => {
  const row = findUserByIdStmt.get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
};

export const createSession = (userId: string, expiresAt: Date): string => {
  const id = generateSessionToken();
  const publicId = randomUUID();
  insertSessionStmt.run(id, publicId, userId, expiresAt.toISOString());
  return id;
};

export const findValidSession = (sessionId: string): User | null => {
  const row = findValidSessionStmt.get(sessionId, new Date().toISOString(), idleCutoff()) as
    | (SessionRow & { u_id: string; u_nome: string; u_email: string; u_created_at: string })
    | undefined;

  if (!row) {
    return null;
  }

  touchSessionStmt.run(new Date().toISOString(), sessionId);

  return { id: row.u_id, nome: row.u_nome, email: row.u_email, createdAt: row.u_created_at };
};

export const deleteSession = (sessionId: string): void => {
  deleteSessionStmt.run(sessionId);
};

export const deleteSessionForUser = (userId: string, publicId: string): boolean => {
  const result = deleteSessionForUserStmt.run(publicId, userId);
  return result.changes > 0;
};

export const listSessionsForUser = (userId: string, currentSessionId: string | undefined): SessionSummary[] => {
  const rows = listSessionsForUserStmt.all(userId, new Date().toISOString(), idleCutoff()) as Array<{
    public_id: string;
    created_at: string;
    last_seen_at: string;
    id: string;
  }>;

  return rows.map((row) => ({
    publicId: row.public_id,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    current: row.id === currentSessionId,
  }));
};
