import { TextField } from '../../components/ui/TextField';
import type { DocumentoAnexadoFilter, ClienteFilters } from './cliente-filters';

type ClienteFilterBarProps = {
  readonly filters: ClienteFilters;
  readonly onChange: (filters: ClienteFilters) => void;
  readonly resultCount: number;
};

const selectClassName =
  'h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]';

export const ClienteFilterBar = ({ filters, onChange, resultCount }: ClienteFilterBarProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <TextField
          label="Buscar"
          type="text"
          placeholder="Nome, documento, e-mail, cidade, código..."
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-tipo-documento" className="text-xs font-medium text-[var(--text)]">
          Tipo de documento
        </label>
        <select
          id="filtro-tipo-documento"
          value={filters.tipoDocumento}
          onChange={(event) =>
            onChange({ ...filters, tipoDocumento: event.target.value as ClienteFilters['tipoDocumento'] })
          }
          className={selectClassName}
        >
          <option value="TODOS">Todos</option>
          <option value="CPF">CPF</option>
          <option value="CNPJ">CNPJ</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-documento-anexado" className="text-xs font-medium text-[var(--text)]">
          Documento anexado
        </label>
        <select
          id="filtro-documento-anexado"
          value={filters.documentoAnexado}
          onChange={(event) =>
            onChange({ ...filters, documentoAnexado: event.target.value as DocumentoAnexadoFilter })
          }
          className={selectClassName}
        >
          <option value="TODOS">Todos</option>
          <option value="SIM">Sim</option>
          <option value="NAO">Não</option>
        </select>
      </div>
    </div>

    <span className="text-right text-xs text-[var(--panel-muted)]">
      {resultCount} {resultCount === 1 ? 'cliente encontrado' : 'clientes encontrados'}
    </span>
  </div>
);
