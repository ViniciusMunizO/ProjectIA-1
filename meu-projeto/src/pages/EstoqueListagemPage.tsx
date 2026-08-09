import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
import { ToastViewport } from '../components/ui/ToastViewport';
import { EntradaEstoqueDetailRow } from '../features/estoque/EntradaEstoqueDetailRow';
import { EntradaEstoqueFilterBar } from '../features/estoque/EntradaEstoqueFilterBar';
import {
  EMPTY_ENTRADA_ESTOQUE_FILTERS,
  filterEntradasEstoque,
  type EntradaEstoqueFilters,
} from '../features/estoque/entrada-estoque-filters';
import { useEntradasEstoqueList } from '../features/estoque/useEntradasEstoqueList';
import { useAuth } from '../hooks/useAuth';
import { useToasts } from '../hooks/useToasts';

export const EstoqueListagemPage = () => {
  const { user, logout } = useAuth();
  const { entradas, isLoading, error, refresh } = useEntradasEstoqueList();
  const { toasts, pushToast, dismissToast } = useToasts();
  const [filters, setFilters] = useState<EntradaEstoqueFilters>(EMPTY_ENTRADA_ESTOQUE_FILTERS);

  const location = useLocation();
  const navigate = useNavigate();
  const hasShownSuccessToast = useRef(false);

  useEffect(() => {
    const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;
    if (successMessage && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      pushToast(successMessage, 'success');
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entradasFiltradas = useMemo(() => filterEntradasEstoque(entradas, filters), [entradas, filters]);

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
              Entradas de estoque
            </h1>
            <p className="text-pretty text-sm text-[var(--text)]">
              Consulte todas as notas de entrada registradas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-sm font-medium text-[var(--accent)] underline underline-offset-2">
              Voltar ao painel
            </Link>
            <Button variant="solid" onClick={() => navigate('/estoque/novo')}>
              + Nova entrada
            </Button>
          </div>
        </div>

        <EntradaEstoqueFilterBar filters={filters} onChange={setFilters} resultCount={entradasFiltradas.length} />

        {isLoading ? (
          <Spinner className="size-5 text-[var(--text)]" />
        ) : error ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <Button variant="ghost" onClick={() => void refresh()}>
              Tentar novamente
            </Button>
          </div>
        ) : entradasFiltradas.length === 0 ? (
          <p className="text-sm text-[var(--text)]">
            {entradas.length === 0
              ? 'Nenhuma entrada de estoque registrada ainda.'
              : 'Nenhuma entrada encontrada com os filtros atuais.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Emissão</th>
                  <th className="px-4 py-3">Custo total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entradasFiltradas.map((nota) => (
                  <EntradaEstoqueDetailRow key={nota.id} nota={nota} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
