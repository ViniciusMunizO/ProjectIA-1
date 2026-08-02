import type { User } from '../../../../shared/src/types/auth.types.js';
import { env } from '../../config/env.js';
import { AppError, conflict, unauthorized } from '../../lib/http-error.js';
import { hashPassword, verifyPassword } from '../../lib/password-hash.js';
import {
  createSession,
  createUser,
  deleteSession,
  deleteSessionForUser,
  findUserByEmail,
  findValidSession,
  listSessionsForUser,
  type SessionSummary,
} from './auth.repository.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Both the rate limiter (see rate-limit.middleware.ts) and this failure
// counter live in process memory: correct for a single server instance,
// but reset on restart and not shared across more than one instance. Move
// both to a shared store (e.g. Redis, or a table in the existing database)
// before running more than one server process.
type FailureRecord = { count: number; lockedUntil: number | null };

const failuresByEmail = new Map<string, FailureRecord>();

const isLocked = (email: string): boolean => {
  const record = failuresByEmail.get(email);
  return Boolean(record?.lockedUntil && record.lockedUntil > Date.now());
};

const recordFailure = (email: string): void => {
  const record = failuresByEmail.get(email) ?? { count: 0, lockedUntil: null };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    record.count = 0;
  }

  failuresByEmail.set(email, record);
};

const clearFailures = (email: string): void => {
  failuresByEmail.delete(email);
};

const sessionExpiry = (): Date => new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);

export const signup = async (nome: string, email: string, senha: string): Promise<User> => {
  // Hash before checking whether the account exists (rather than after) so
  // the two outcomes take the same time, closing the timing side-channel
  // that would otherwise let the status code alone reveal account existence.
  const passwordHash = await hashPassword(senha);
  const existing = findUserByEmail(email);

  if (existing) {
    throw conflict('E-mail já cadastrado');
  }

  return createUser(nome, email, passwordHash);
};

export const login = async (
  email: string,
  senha: string,
): Promise<{ user: User; sessionId: string; expiresAt: Date }> => {
  if (isLocked(email)) {
    throw new AppError(429, 'Muitas tentativas. Tente novamente mais tarde.');
  }

  const existing = findUserByEmail(email);
  const passwordMatches = await verifyPassword(existing?.passwordHash ?? null, senha);

  if (!existing || !passwordMatches) {
    recordFailure(email);
    throw unauthorized('Credenciais inválidas');
  }

  clearFailures(email);

  const expiresAt = sessionExpiry();
  const sessionId = createSession(existing.id, expiresAt);

  return { user: { id: existing.id, nome: existing.nome, email: existing.email, createdAt: existing.createdAt }, sessionId, expiresAt };
};

export const getUserBySession = (sessionId: string | undefined): User | null => {
  if (!sessionId) {
    return null;
  }
  return findValidSession(sessionId);
};

export const logout = (sessionId: string | undefined): void => {
  if (sessionId) {
    deleteSession(sessionId);
  }
};

export const createSessionForUser = (userId: string): { sessionId: string; expiresAt: Date } => {
  const expiresAt = sessionExpiry();
  const sessionId = createSession(userId, expiresAt);
  return { sessionId, expiresAt };
};

export const listSessions = (userId: string, currentSessionId: string | undefined): SessionSummary[] =>
  listSessionsForUser(userId, currentSessionId);

export const revokeSession = (userId: string, publicId: string): boolean =>
  deleteSessionForUser(userId, publicId);
