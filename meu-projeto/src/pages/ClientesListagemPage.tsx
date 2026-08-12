import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { canWrite } from '../../../shared/src/types/auth.types';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
import { ToastViewport } from '../components/ui/ToastViewport';
import type { ToastVariant } from '../components/ui/Toast';
import { ClienteDetailRow } from '../features/clientes/ClienteDetailRow';
import { ClienteFilterBar } from '../features/clientes/ClienteFilterBar';
import { EMPTY_CLIENTE_FILTERS, filterClientes, type ClienteFilters } from '../features/clientes/cliente-filters';
import { useClientesList } from '../features/clientes/useClientesList';
import { useAuth } from '../hooks/useAuth';
import { useToasts } from '../hooks/useToasts';

type FlashState = {
  readonly successMessage?: string;
  readonly successVariant?: ToastVariant;
};

export const ClientesListagemPage = () => {
  const { user, logout } = useAuth();
  const { clientes, isLoading, error, replaceCliente, refresh } = useClientesList();
  const { toasts, pushToast, dismissToast } = useToasts();
  const [filters, setFilters] = useState<ClienteFilters>(EMPTY_CLIENTE_FILTERS);

  const location = useLocation();
  const navigate = useNavigate();
  // StrictMode intentionally double-invokes effects in development; the
  // navigate() below is what clears location.state, but that update lands
  // asynchronously, so both invocations would otherwise still see the same
  // successMessage and push the toast twice. The ref survives StrictMode's
  // replay (only the effect callback re-runs, not the component instance),
  // so it's what actually makes this run once.
  const hasShownSuccessToast = useRef(false);

  useEffect(() => {
    const state = location.state as FlashState | null;
    if (state?.successMessage && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      pushToast(state.successMessage, state.successVariant ?? 'success');
      navigate(location.pathname, { replace: true, state: null });
    }
    // Only ever meant to run once, right after a redirect carrying flash
    // state — re-running on every render would re-fire the toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = useMemo(() => filterClientes(clientes, filters), [clientes, filters]);

  return (
    <div className="min-h-svh bg-[var(--bg)]">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text)]">Olá, {user?.nome}</span>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">Clientes</h1>
            <p className="text-pretty text-sm text-[var(--text)]">
              Consulte todos os clientes cadastrados, com filtro de busca detalhado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-sm font-medium text-[var(--accent)] underline underline-offset-2">
              Voltar ao painel
            </Link>
            {canWrite(user?.role ?? null) ? (
              <Button variant="solid" onClick={() => navigate('/clientes/novo')}>
                + Novo cliente
              </Button>
            ) : null}
          </div>
        </div>

        <ClienteFilterBar filters={filters} onChange={setFilters} resultCount={clientesFiltrados.length} />

        {isLoading ? (
          <Spinner className="size-5 text-[var(--text)]" />
        ) : error ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <Button variant="ghost" onClick={() => void refresh()}>
              Tentar novamente
            </Button>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-sm text-[var(--text)]">
            {clientes.length === 0
              ? 'Nenhum cliente cadastrado ainda.'
              : 'Nenhum cliente encontrado com os filtros atuais.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Documento anexado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <ClienteDetailRow
                    key={cliente.id}
                    cliente={cliente}
                    actorRole={user?.role ?? null}
                    onUpdated={replaceCliente}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
