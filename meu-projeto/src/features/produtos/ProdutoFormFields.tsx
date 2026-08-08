import { CATEGORIAS_PRODUTO } from '../../../../shared/src/types/produto.types';
import { TextField } from '../../components/ui/TextField';
import { categoriaLabel } from '../../lib/produto-labels';
import type { ProdutoFieldErrors, ProdutoFormFieldsState } from './produto-form-state';

type ProdutoFormFieldsProps = {
  readonly fields: ProdutoFormFieldsState;
  readonly setField: <K extends keyof ProdutoFormFieldsState>(key: K, value: ProdutoFormFieldsState[K]) => void;
  readonly fieldErrors: ProdutoFieldErrors;
};

export const ProdutoFormFields = ({ fields, setField, fieldErrors }: ProdutoFormFieldsProps) => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="Nome do produto"
        type="text"
        value={fields.nome}
        onChange={(event) => setField('nome', event.target.value)}
        error={fieldErrors.nome}
      />
      <TextField
        label="Nome comercial"
        type="text"
        value={fields.nomeComercial}
        onChange={(event) => setField('nomeComercial', event.target.value)}
        error={fieldErrors.nomeComercial}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="Marca"
        type="text"
        value={fields.marca}
        onChange={(event) => setField('marca', event.target.value)}
        error={fieldErrors.marca}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoria" className="text-xs font-medium text-[var(--text)]">
          Categoria
        </label>
        <select
          id="categoria"
          value={fields.categoria}
          onChange={(event) => setField('categoria', event.target.value as ProdutoFormFieldsState['categoria'])}
          className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
        >
          <option value="" disabled>
            Selecione...
          </option>
          {CATEGORIAS_PRODUTO.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoriaLabel(categoria)}
            </option>
          ))}
        </select>
        {fieldErrors.categoria ? (
          <p className="text-xs text-[var(--danger)]" role="alert">
            {fieldErrors.categoria}
          </p>
        ) : null}
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="descricao" className="text-xs font-medium text-[var(--text)]">
        Descrição (opcional)
      </label>
      <textarea
        id="descricao"
        rows={3}
        value={fields.descricao}
        onChange={(event) => setField('descricao', event.target.value)}
        className="rounded-xl border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
      />
      {fieldErrors.descricao ? (
        <p className="text-xs text-[var(--danger)]" role="alert">
          {fieldErrors.descricao}
        </p>
      ) : null}
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="EAN (opcional)"
        type="text"
        value={fields.ean}
        onChange={(event) => setField('ean', event.target.value)}
        error={fieldErrors.ean}
      />
      <TextField
        label="Registro ANVISA (opcional)"
        type="text"
        value={fields.registroAnvisa}
        onChange={(event) => setField('registroAnvisa', event.target.value)}
        error={fieldErrors.registroAnvisa}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="Código de barras"
        type="text"
        value={fields.codigoBarras}
        onChange={(event) => setField('codigoBarras', event.target.value)}
        error={fieldErrors.codigoBarras}
      />
      <TextField
        label="Quantidade na caixa"
        type="number"
        min={1}
        value={fields.quantidadeCaixa}
        onChange={(event) => setField('quantidadeCaixa', event.target.value)}
        error={fieldErrors.quantidadeCaixa}
      />
    </div>

    {fields.categoria === 'MEDICAMENTO' ? (
      <label className="flex items-center gap-2 text-sm text-[var(--text-h)]">
        <input
          type="checkbox"
          checked={fields.controlado}
          onChange={(event) => setField('controlado', event.target.checked)}
          className="size-4 rounded border-[var(--border)] accent-[var(--accent)]"
        />
        Produto controlado
      </label>
    ) : null}
  </>
);
