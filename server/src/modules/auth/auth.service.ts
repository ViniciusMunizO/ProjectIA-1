import type { User } from '../../../../shared/src/types/auth.types.js';
import { env } from '../../config/env.js';
import { AppError, conflict, forbidden, unauthorized } from '../../lib/http-error.js';
import { hashPassword, verifyPassword } from '../../lib/password-hash.js';
import { validateSignupKey } from '../admin/signup-key.service.js';
import {
  countUsers,
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

const formatDateTimeBR = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const signup = async (
  nome: string,
  email: string,
  senha: string,
  chaveAcesso: string,
  createdIp: string | null,
): Promise<User> => {
  // Bootstrap: an empty users table has no ADMIN to have generated a key in
  // the first place, so the very first account skips the key check and is
  // granted ADMIN directly. Every signup after that goes through the normal
  // key gate, since the count is then nonzero.
  const isFirstAccount = (await countUsers()) === 0;

  if (!isFirstAccount) {
    const keyValid = await validateSignupKey(chaveAcesso);
    if (!keyValid) {
      throw new AppError(
        403,
        'Chave de acesso inválida ou expirada. Peça a um administrador a chave vigente.',
      );
    }
  }

  // Hash before checking whether the account exists (rather than after) so
  // the two outcomes take the same time, closing the timing side-channel
  // that would otherwise let the status code alone reveal account existence.
  const passwordHash = await hashPassword(senha);
  const existing = await findUserByEmail(email);

  if (existing) {
    throw conflict('E-mail já cadastrado');
  }

  return createUser(nome, email, passwordHash, null, createdIp, isFirstAccount ? 'ADMIN' : null);
};

export const login = async (
  email: string,
  senha: string,
): Promise<{ user: User; sessionId: string; expiresAt: Date }> => {
  if (isLocked(email)) {
    throw new AppError(429, 'Muitas tentativas. Tente novamente mais tarde.');
  }

  const existing = await findUserByEmail(email);
  const passwordMatches = await verifyPassword(existing?.passwordHash ?? null, senha);

  if (!existing || !passwordMatches) {
    recordFailure(email);
    throw unauthorized('Credenciais inválidas');
  }

  clearFailures(email);

  if (existing.blockedUntil && new Date(existing.blockedUntil).getTime() > Date.now()) {
    throw forbidden(`Sua conta está temporariamente bloqueada até ${formatDateTimeBR(existing.blockedUntil)}.`);
  }

  const expiresAt = sessionExpiry();
  const sessionId = await createSession(existing.id, expiresAt);

  return {
    user: {
      id: existing.id,
      nome: existing.nome,
      email: existing.email,
      role: existing.role,
      blockedUntil: existing.blockedUntil,
      createdAt: existing.createdAt,
    },
    sessionId,
    expiresAt,
  };
};

export const getUserBySession = (sessionId: string | undefined): Promise<User | null> => {
  if (!sessionId) {
    return Promise.resolve(null);
  }
  return findValidSession(sessionId);
};

export const logout = async (sessionId: string | undefined): Promise<void> => {
  if (sessionId) {
    await deleteSession(sessionId);
  }
};

export const createSessionForUser = async (
  userId: string,
): Promise<{ sessionId: string; expiresAt: Date }> => {
  const expiresAt = sessionExpiry();
  const sessionId = await createSession(userId, expiresAt);
  return { sessionId, expiresAt };
};

export const listSessions = (
  userId: string,
  currentSessionId: string | undefined,
): Promise<SessionSummary[]> => listSessionsForUser(userId, currentSessionId);

export const revokeSession = (userId: string, publicId: string): Promise<boolean> =>
  deleteSessionForUser(userId, publicId);
