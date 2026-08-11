import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
import { UsersTable } from '../features/admin/UsersTable';
import { useUsersAdmin } from '../features/admin/useUsersAdmin';
import { useAuth } from '../hooks/useAuth';

export const AdminUsersPage = () => {
  const { user, logout } = useAuth();
  const { users, isLoading, error, actionError, updateUser, removeUser } = useUsersAdmin();

  if (!user?.role) {
    return null;
  }

  return (
    <div className="min-h-svh bg-[var(--bg)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text)]">Olá, {user.nome}</span>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">Usuários</h1>
            <p className="text-pretty text-sm text-[var(--text)]">
              Gerencie contas e papéis. Contas recém-criadas ficam sem acesso até receberem um
              papel.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[var(--accent)] underline underline-offset-2"
          >
            Voltar ao painel
          </Link>
        </div>

        {actionError ? (
          <p role="alert" className="text-sm text-[var(--danger)]">
            {actionError}
          </p>
        ) : null}

        {isLoading ? (
          <Spinner className="size-5 text-[var(--text)]" />
        ) : error ? (
          <p className="text-sm text-[var(--danger)]">{error}</p>
        ) : (
          <UsersTable
            users={users}
            currentUserId={user.id}
            actorRole={user.role}
            onUpdate={updateUser}
            onRemove={removeUser}
          />
        )}
      </main>
    </div>
  );
};
