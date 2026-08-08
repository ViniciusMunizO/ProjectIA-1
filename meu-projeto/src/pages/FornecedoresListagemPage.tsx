import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
import { ToastViewport } from '../components/ui/ToastViewport';
import { FornecedorDetailRow } from '../features/fornecedores/FornecedorDetailRow';
import { FornecedorFilterBar } from '../features/fornecedores/FornecedorFilterBar';
import {
  EMPTY_FORNECEDOR_FILTERS,
  filterFornecedores,
  type FornecedorFilters,
} from '../features/fornecedores/fornecedor-filters';
import { useFornecedoresList } from '../features/fornecedores/useFornecedoresList';
import { useAuth } from '../hooks/useAuth';
import { useToasts } from '../hooks/useToasts';

export const FornecedoresListagemPage = () => {
  const { user, logout } = useAuth();
  const { fornecedores, isLoading, error, replaceFornecedor, refresh } = useFornecedoresList();
  const { toasts, pushToast, dismissToast } = useToasts();
  const [filters, setFilters] = useState<FornecedorFilters>(EMPTY_FORNECEDOR_FILTERS);

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
    const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;
    if (successMessage && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      pushToast(successMessage, 'success');
      navigate(location.pathname, { replace: true, state: null });
    }
    // Only ever meant to run once, right after a redirect carrying flash
    // state — re-running on every render would re-fire the toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fornecedoresFiltrados = useMemo(() => filterFornecedores(fornecedores, filters), [fornecedores, filters]);

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
            <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">
              Fornecedores
            </h1>
            <p className="text-pretty text-sm text-[var(--text)]">
              Consulte todos os fornecedores cadastrados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-sm font-medium text-[var(--accent)] underline underline-offset-2">
              Voltar ao painel
            </Link>
            <Button variant="solid" onClick={() => navigate('/fornecedores/novo')}>
              + Novo fornecedor
            </Button>
          </div>
        </div>

        <FornecedorFilterBar filters={filters} onChange={setFilters} resultCount={fornecedoresFiltrados.length} />

        {isLoading ? (
          <Spinner className="size-5 text-[var(--text)]" />
        ) : error ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <Button variant="ghost" onClick={() => void refresh()}>
              Tentar novamente
            </Button>
          </div>
        ) : fornecedoresFiltrados.length === 0 ? (
          <p className="text-sm text-[var(--text)]">
            {fornecedores.length === 0
              ? 'Nenhum fornecedor cadastrado ainda.'
              : 'Nenhum fornecedor encontrado com os filtros atuais.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Razão social</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3">Cidade/UF</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <FornecedorDetailRow
                    key={fornecedor.id}
                    fornecedor={fornecedor}
                    actorRole={user?.role ?? null}
                    onUpdated={replaceFornecedor}
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
