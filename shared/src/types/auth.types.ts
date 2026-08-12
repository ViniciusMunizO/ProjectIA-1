// Ordered lowest to highest privilege — this order backs the role dropdown
// in the Usuários panel. Nível 0 (sem permissão) is role === null, not a
// member of this list; the four assignable roles below are níveis 1–4:
// CONSULTA (1, read-only everywhere), FUNCIONARIO (2, full CRUD except
// user management), FARMACEUTICO (3, same as 2 plus the exclusive
// produto-auditado toggle), GERENTE/ADMIN (4, full control including
// granting/revoking roles).
export const USER_ROLES = ['CONSULTA', 'FUNCIONARIO', 'FARMACEUTICO', 'GERENTE', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Every role that may create, edit, or delete data — i.e. every assigned
// role except CONSULTA, which requireRole gates to read-only routes only.
export const WRITE_ROLES = ['FUNCIONARIO', 'FARMACEUTICO', 'GERENTE', 'ADMIN'] as const satisfies readonly UserRole[];

export const canWrite = (role: UserRole | null): boolean =>
  role !== null && (WRITE_ROLES as readonly UserRole[]).includes(role);

export type User = {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  // null: self-registered, awaiting an ADMIN/GERENTE to assign a role.
  readonly role: UserRole | null;
  readonly blockedUntil: string | null;
  readonly createdAt: string;
};

// Extra fields shown only to an ADMIN caller (see the admin users listing).
export type AdminUserView = User & {
  readonly createdByNome: string | null;
  readonly createdIp: string | null;
};
