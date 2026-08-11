import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { DashboardTile } from '../features/dashboard/DashboardTile';
import { useAuth } from '../hooks/useAuth';
import { roleLabel } from '../lib/role-labels';

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M3.5 19c0-3 2.5-5.25 5.5-5.25s5.5 2.25 5.5 5.25M15.5 8.75a3.25 3.25 0 1 1 2.62 5.18M20.5 19c0-2.4-1.7-4.4-4-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 10.5h6M13 13.5h6M6 16.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <path
      d="M12 3.5 20.5 8v8L12 20.5 3.5 16V8L12 3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M3.5 8 12 12.5 20.5 8M12 12.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const BoxesIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <rect x="3" y="10" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="10" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 10V6.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <path d="M3 7h10v9H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 10.5h4l3.5 3V16H13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="7" cy="18" r="1.75" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.5" cy="18" r="1.75" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <path
      d="M6.5 3.5h8L19 8v12.5a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-16a.5.5 0 0 1 .5-.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M9 12.5h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const canManageUsers = user?.role === 'ADMIN' || user?.role === 'GERENTE';

  return (
    <div className="min-h-svh bg-[var(--bg)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text)]">
            Olá, {user?.nome} · {roleLabel(user?.role ?? null)}
          </span>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
        {!user?.role ? (
          <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-5 py-4 text-sm text-[var(--danger)]">
            Sua conta está aguardando um administrador ou gerente atribuir seu papel de acesso.
            Algumas áreas ficarão indisponíveis até lá.
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">
            Painel VMO
          </h1>
          <p className="text-pretty text-sm text-[var(--text)]">
            Acesse os módulos do sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canManageUsers ? (
            <DashboardTile
              title="Usuários"
              description="Gerenciar contas e papéis."
              icon={<UsersIcon />}
              to="/admin/usuarios"
            />
          ) : null}
          <DashboardTile
            title="Clientes"
            description="Cadastro de clientes (CPF/CNPJ)."
            icon={<IdCardIcon />}
            to="/clientes"
          />
          <DashboardTile
            title="Produtos/Estoque"
            description="Catálogo de produtos e auditoria."
            icon={<PackageIcon />}
            to="/produtos"
          />
          <DashboardTile
            title="Entrada de Produtos"
            description="Entradas de estoque por nota."
            icon={<BoxesIcon />}
            to="/estoque"
          />
          <DashboardTile
            title="Fornecedores"
            description="Cadastro de fornecedores."
            icon={<TruckIcon />}
            to="/fornecedores"
          />
          <DashboardTile
            title="Pedidos"
            description="Pedidos e orçamentos em PDF."
            icon={<FileTextIcon />}
            to="/pedidos"
          />
        </div>
      </main>
    </div>
  );
};
