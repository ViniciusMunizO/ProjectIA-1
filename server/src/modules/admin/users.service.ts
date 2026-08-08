import type { AdminUserView, User, UserRole } from '../../../../shared/src/types/auth.types.js';
import type { UpdateUserInput } from '../../../../shared/src/schemas/admin.schemas.js';
import { AppError, forbidden, notFound } from '../../lib/http-error.js';
import { deleteUserById, findUserRoleById, listAllUsers, updateUserFields } from './users.repository.js';

const MANAGER_RESTRICTED_ROLES: readonly UserRole[] = ['ADMIN', 'GERENTE'];

// GERENTE may only manage FUNCIONARIO/FARMACEUTICO/pending accounts, and may
// only ever grant those same two roles: promoting to GERENTE is reserved for
// ADMIN, and a GERENTE must never edit, block, or remove an ADMIN or another
// GERENTE.
const assertManagerCanActOnTarget = (actorRole: UserRole, targetRole: UserRole | null): void => {
  if (actorRole === 'GERENTE' && targetRole && MANAGER_RESTRICTED_ROLES.includes(targetRole)) {
    throw forbidden('Apenas o ADMIN pode gerenciar contas de ADMIN ou GERENTE.');
  }
};

const assertManagerCanGrantRole = (actorRole: UserRole, newRole: UserRole): void => {
  if (actorRole === 'GERENTE' && MANAGER_RESTRICTED_ROLES.includes(newRole)) {
    throw forbidden('Apenas o ADMIN pode atribuir o papel de ADMIN ou GERENTE.');
  }
};

const requireTargetRole = async (targetId: string): Promise<UserRole | null> => {
  const role = await findUserRoleById(targetId);
  if (role === undefined) {
    throw notFound('Usuário não encontrado');
  }
  return role;
};

// AdminUserView carries fields (createdByNome, createdIp) that only an ADMIN
// may see; a GERENTE gets the same list stripped down to the plain User
// shape. Filtering happens here, server-side, rather than left to the
// frontend to decide what to render.
export const listUsersFor = async (actorRole: UserRole): Promise<AdminUserView[] | User[]> => {
  const users = await listAllUsers();

  if (actorRole === 'ADMIN') {
    return users;
  }

  return users.map(({ id, nome, email, role, blockedUntil, createdAt }) => ({
    id,
    nome,
    email,
    role,
    blockedUntil,
    createdAt,
  }));
};

export const updateUser = async (
  actor: User,
  targetId: string,
  input: UpdateUserInput,
): Promise<void> => {
  if (!actor.role) {
    throw forbidden();
  }

  const targetRole = await requireTargetRole(targetId);
  assertManagerCanActOnTarget(actor.role, targetRole);
  assertManagerCanGrantRole(actor.role, input.role);

  await updateUserFields(targetId, input, actor.id);
};

export const removeUser = async (actor: User, targetId: string): Promise<void> => {
  if (!actor.role) {
    throw forbidden();
  }

  if (targetId === actor.id) {
    throw new AppError(400, 'Você não pode remover a própria conta.');
  }

  const targetRole = await requireTargetRole(targetId);
  assertManagerCanActOnTarget(actor.role, targetRole);

  await deleteUserById(targetId);
};
