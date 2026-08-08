import type { UserRole } from '../../../shared/src/types/auth.types';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  FUNCIONARIO: 'Funcionário',
  FARMACEUTICO: 'Farmacêutico',
};

export const roleLabel = (role: UserRole | null): string => (role ? ROLE_LABELS[role] : 'Pendente');
