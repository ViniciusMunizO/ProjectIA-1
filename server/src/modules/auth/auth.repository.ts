import { supabase, unwrap } from '../../db/supabase.js';
import { env } from '../../config/env.js';
import { generateSessionToken } from '../../lib/session-token.js';
import type { User, UserRole } from '../../../../shared/src/types/auth.types.js';

type UserRow = {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  role: UserRole | null;
  blocked_until: string | null;
  created_at: string;
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
  role: row.role,
  blockedUntil: row.blocked_until,
  createdAt: row.created_at,
});

const idleCutoff = (): string =>
  new Date(Date.now() - env.SESSION_IDLE_TIMEOUT_HOURS * 60 * 60 * 1000).toISOString();

const USER_COLUMNS = 'id, nome, email, password_hash, role, blocked_until, created_at';

export const createUser = async (
  nome: string,
  email: string,
  passwordHash: string,
  createdBy: string | null,
  createdIp: string | null,
  role: UserRole | null = null,
): Promise<User> => {
  const row = unwrap(
    await supabase
      .from('users')
      .insert({
        nome,
        email,
        password_hash: passwordHash,
        created_by: createdBy,
        created_ip: createdIp,
        role,
      })
      .select(USER_COLUMNS)
      .single(),
  ) as UserRow;

  return toUser(row);
};

// Supabase's REST count uses a HEAD request with a Prefer header, so no rows
// are actually transferred just to learn whether the table is empty.
export const countUsers = async (): Promise<number> => {
  const { count, error } = await supabase.from('users').select('id', { count: 'exact', head: true });

  if (error) {
    throw error;
  }
  return count ?? 0;
};

export const findUserByEmail = async (
  email: string,
): Promise<(User & { readonly passwordHash: string }) | null> => {
  const { data, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as UserRow;
  return { ...toUser(row), passwordHash: row.password_hash };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase.from('users').select(USER_COLUMNS).eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  return data ? toUser(data as UserRow) : null;
};

export const createSession = async (userId: string, expiresAt: Date): Promise<string> => {
  const id = generateSessionToken();
  unwrap(
    await supabase
      .from('sessions')
      .insert({ id, user_id: userId, expires_at: expiresAt.toISOString() })
      .select('id')
      .single(),
  );
  return id;
};

type ValidSessionRow = {
  id: string;
  users: UserRow | null;
};

export const findValidSession = async (sessionId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`id, users (${USER_COLUMNS})`)
    .eq('id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .gt('last_seen_at', idleCutoff())
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as unknown as ValidSessionRow;
  if (!row.users) {
    return null;
  }

  await supabase.from('sessions').update({ last_seen_at: new Date().toISOString() }).eq('id', sessionId);

  return toUser(row.users);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await supabase.from('sessions').delete().eq('id', sessionId);
};

export const deleteSessionForUser = async (userId: string, publicId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('sessions')
    .delete()
    .eq('public_id', publicId)
    .eq('user_id', userId)
    .select('id');

  if (error) {
    throw error;
  }
  return (data?.length ?? 0) > 0;
};

export const listSessionsForUser = async (
  userId: string,
  currentSessionId: string | undefined,
): Promise<SessionSummary[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, public_id, created_at, last_seen_at')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .gt('last_seen_at', idleCutoff())
    .order('last_seen_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as Array<{ id: string; public_id: string; created_at: string; last_seen_at: string }>).map(
    (row) => ({
      publicId: row.public_id,
      createdAt: row.created_at,
      lastSeenAt: row.last_seen_at,
      current: row.id === currentSessionId,
    }),
  );
};
