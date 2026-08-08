export const USER_ROLES = ['ADMIN', 'GERENTE', 'FUNCIONARIO', 'FARMACEUTICO'] as const;

export type UserRole = (typeof USER_ROLES)[number];

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
