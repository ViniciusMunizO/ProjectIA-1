import type { AdminUserView, UserRole } from '../../../../shared/src/types/auth.types.js';
import { supabase, unwrap } from '../../db/supabase.js';

type UserRow = {
  id: string;
  nome: string;
  email: string;
  role: UserRole | null;
  blocked_until: string | null;
  created_by: string | null;
  created_ip: string | null;
  created_at: string;
};

const toAdminUserView = (row: UserRow, creatorNomeById: ReadonlyMap<string, string>): AdminUserView => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  role: row.role,
  blockedUntil: row.blocked_until,
  createdAt: row.created_at,
  createdByNome: row.created_by ? (creatorNomeById.get(row.created_by) ?? null) : null,
  createdIp: row.created_ip,
});

export const listAllUsers = async (): Promise<AdminUserView[]> => {
  const rows = unwrap(
    await supabase
      .from('users')
      .select('id, nome, email, role, blocked_until, created_by, created_ip, created_at')
      .order('created_at', { ascending: false }),
  ) as UserRow[];

  const nomeById = new Map(rows.map((row) => [row.id, row.nome]));

  return rows.map((row) => toAdminUserView(row, nomeById));
};

export const findUserRoleById = async (id: string): Promise<UserRole | null | undefined> => {
  const { data, error } = await supabase.from('users').select('role').eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  return data ? (data as { role: UserRole | null }).role : undefined;
};

export const updateUserFields = async (
  id: string,
  fields: { nome: string; email: string; role: UserRole },
  updatedBy: string,
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({
      nome: fields.nome,
      email: fields.email,
      role: fields.role,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
};

export const deleteUserById = async (id: string): Promise<void> => {
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    throw error;
  }
};
