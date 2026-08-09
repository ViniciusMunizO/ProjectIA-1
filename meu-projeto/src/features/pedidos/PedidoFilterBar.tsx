import { DateField } from '../../components/ui/DateField';
import { TextField } from '../../components/ui/TextField';
import type { PedidoFilters } from './pedido-filters';

type PedidoFilterBarProps = {
  readonly filters: PedidoFilters;
  readonly onChange: (filters: PedidoFilters) => void;
  readonly resultCount: number;
};

export const PedidoFilterBar = ({ filters, onChange, resultCount }: PedidoFilterBarProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="sm:col-span-1">
        <TextField
          label="Buscar"
          type="text"
          placeholder="Cliente, código, número do pedido..."
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
        />
      </div>
      <DateField
        label="Emissão de"
        value={filters.dataInicio}
        onChange={(isoValue) => onChange({ ...filters, dataInicio: isoValue })}
      />
      <DateField
        label="Emissão até"
        value={filters.dataFim}
        onChange={(isoValue) => onChange({ ...filters, dataFim: isoValue })}
      />
    </div>
    <span className="text-right text-xs text-[var(--panel-muted)]">
      {resultCount} {resultCount === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
    </span>
  </div>
);
