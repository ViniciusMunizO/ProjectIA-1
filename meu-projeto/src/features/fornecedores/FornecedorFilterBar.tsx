import { TextField } from '../../components/ui/TextField';
import type { FornecedorFilters } from './fornecedor-filters';

type FornecedorFilterBarProps = {
  readonly filters: FornecedorFilters;
  readonly onChange: (filters: FornecedorFilters) => void;
  readonly resultCount: number;
};

export const FornecedorFilterBar = ({ filters, onChange, resultCount }: FornecedorFilterBarProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
    <TextField
      label="Buscar"
      type="text"
      placeholder="Razão social, nome fantasia, CNPJ, cidade, código..."
      value={filters.busca}
      onChange={(event) => onChange({ ...filters, busca: event.target.value })}
    />
    <span className="text-right text-xs text-[var(--panel-muted)]">
      {resultCount} {resultCount === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}
    </span>
  </div>
);
