import { CATEGORIAS_PRODUTO } from '../../../../shared/src/types/produto.types';
import { TextField } from '../../components/ui/TextField';
import { categoriaLabel } from '../../lib/produto-labels';
import type { AuditadoFilter, ControladoFilter, ProdutoFilters } from './produto-filters';

type ProdutoFilterBarProps = {
  readonly filters: ProdutoFilters;
  readonly onChange: (filters: ProdutoFilters) => void;
  readonly resultCount: number;
};

const selectClassName =
  'h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]';

export const ProdutoFilterBar = ({ filters, onChange, resultCount }: ProdutoFilterBarProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <TextField
          label="Buscar"
          type="text"
          placeholder="Nome, marca, código, código de barras, EAN..."
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-categoria" className="text-xs font-medium text-[var(--text)]">
          Categoria
        </label>
        <select
          id="filtro-categoria"
          value={filters.categoria}
          onChange={(event) => onChange({ ...filters, categoria: event.target.value as ProdutoFilters['categoria'] })}
          className={selectClassName}
        >
          <option value="TODAS">Todas</option>
          {CATEGORIAS_PRODUTO.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoriaLabel(categoria)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-auditado" className="text-xs font-medium text-[var(--text)]">
          Auditado
        </label>
        <select
          id="filtro-auditado"
          value={filters.auditado}
          onChange={(event) => onChange({ ...filters, auditado: event.target.value as AuditadoFilter })}
          className={selectClassName}
        >
          <option value="TODOS">Todos</option>
          <option value="AUDITADO">Auditado</option>
          <option value="NAO_AUDITADO">Não auditado</option>
        </select>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-controlado" className="text-xs font-medium text-[var(--text)]">
          Controlado
        </label>
        <select
          id="filtro-controlado"
          value={filters.controlado}
          onChange={(event) => onChange({ ...filters, controlado: event.target.value as ControladoFilter })}
          className={`${selectClassName} w-fit`}
        >
          <option value="TODOS">Todos</option>
          <option value="SIM">Sim</option>
          <option value="NAO">Não</option>
        </select>
      </div>

      <span className="text-xs text-[var(--panel-muted)]">
        {resultCount} {resultCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
      </span>
    </div>
  </div>
);
