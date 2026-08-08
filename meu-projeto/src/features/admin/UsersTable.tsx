import { useState } from 'react';
import { USER_ROLES, type AdminUserView, type User, type UserRole } from '../../../../shared/src/types/auth.types';
import { Button } from '../../components/ui/Button';
import { roleLabel } from '../../lib/role-labels';

type UsersTableProps = {
  readonly users: readonly (AdminUserView | User)[];
  readonly currentUserId: string;
  readonly actorRole: UserRole;
  readonly onUpdate: (id: string, input: { nome: string; email: string; role: UserRole }) => Promise<boolean>;
  readonly onRemove: (id: string) => Promise<boolean>;
};

const isAdminView = (user: AdminUserView | User): user is AdminUserView => 'createdByNome' in user;

const MANAGER_RESTRICTED: readonly UserRole[] = ['ADMIN', 'GERENTE'];

const assignableRoles = (actorRole: UserRole): readonly UserRole[] =>
  actorRole === 'ADMIN' ? USER_ROLES : USER_ROLES.filter((role) => !MANAGER_RESTRICTED.includes(role));

type UserRowProps = {
  readonly user: AdminUserView | User;
  readonly showAuditColumns: boolean;
  readonly disabled: boolean;
  readonly assignable: readonly UserRole[];
  readonly onUpdate: UsersTableProps['onUpdate'];
  readonly onRemove: UsersTableProps['onRemove'];
};

const UserRow = ({ user, showAuditColumns, disabled, assignable, onUpdate, onRemove }: UserRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role ?? assignable[0] ?? 'FUNCIONARIO');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    const ok = await onUpdate(user.id, { nome, email, role });
    setIsSaving(false);
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleCancel = (): void => {
    setNome(user.nome);
    setEmail(user.email);
    setRole(user.role ?? assignable[0] ?? 'FUNCIONARIO');
    setIsEditing(false);
  };

  const handleRemove = async (): Promise<void> => {
    if (window.confirm(`Remover a conta de ${user.nome}? Esta ação não pode ser desfeita.`)) {
      await onRemove(user.id);
    }
  };

  if (isEditing) {
    return (
      <tr className="border-b border-[var(--border)] align-top">
        <td className="px-4 py-3">
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-2 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
          />
        </td>
        <td className="px-4 py-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-2 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-2 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
          >
            {assignable.map((option) => (
              <option key={option} value={option}>
                {roleLabel(option)}
              </option>
            ))}
          </select>
        </td>
        {showAuditColumns ? (
          <>
            <td className="px-4 py-3 text-xs text-[var(--text)]">—</td>
            <td className="px-4 py-3 text-xs text-[var(--text)]">—</td>
            <td className="px-4 py-3 text-xs text-[var(--text)]">—</td>
          </>
        ) : null}
        <td className="flex flex-wrap gap-2 px-4 py-3">
          <Button variant="solid" isLoading={isSaving} onClick={() => void handleSave()}>
            Salvar
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[var(--border)] align-top">
      <td className="px-4 py-3 text-sm text-[var(--text-h)]">{user.nome}</td>
      <td className="px-4 py-3 text-sm text-[var(--text)]">{user.email}</td>
      <td className="px-4 py-3 text-sm text-[var(--text)]">{roleLabel(user.role)}</td>
      {showAuditColumns ? (
        <>
          <td className="px-4 py-3 text-xs text-[var(--text)]">
            {isAdminView(user) ? (user.createdByNome ?? 'Autocadastro') : '—'}
          </td>
          <td className="px-4 py-3 text-xs text-[var(--text)]">
            {new Date(user.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </td>
          <td className="px-4 py-3 text-xs text-[var(--text)]">
            {isAdminView(user) ? (user.createdIp ?? '—') : '—'}
          </td>
        </>
      ) : null}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" disabled={disabled} onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <Button variant="ghost" disabled={disabled} onClick={() => void handleRemove()}>
            Remover
          </Button>
        </div>
      </td>
    </tr>
  );
};

export const UsersTable = ({ users, currentUserId, actorRole, onUpdate, onRemove }: UsersTableProps) => {
  const showAuditColumns = actorRole === 'ADMIN';
  const assignable = assignableRoles(actorRole);

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Papel</th>
            {showAuditColumns ? (
              <>
                <th className="px-4 py-3">Criado por</th>
                <th className="px-4 py-3">Data de criação</th>
                <th className="px-4 py-3">IP de origem</th>
              </>
            ) : null}
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isManagerRestrictedTarget =
              actorRole === 'GERENTE' && Boolean(user.role) && MANAGER_RESTRICTED.includes(user.role as UserRole);

            return (
              <UserRow
                key={user.id}
                user={user}
                showAuditColumns={showAuditColumns}
                disabled={isSelf || isManagerRestrictedTarget}
                assignable={assignable}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
