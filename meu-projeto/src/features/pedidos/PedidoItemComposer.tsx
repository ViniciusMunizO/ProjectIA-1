import { UNIDADES_MEDIDA } from '../../../../shared/src/types/entrada-estoque.types';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { sanitizeDecimalInput } from '../../lib/decimal-input';
import type { ItemComposerErrors, ItemComposerState } from './pedido-form-state';

type PedidoItemComposerProps = {
  readonly composer: ItemComposerState;
  readonly setField: <K extends keyof ItemComposerState>(key: K, value: ItemComposerState[K]) => void;
  readonly onCodigoProdutoChange: (value: string) => void;
  readonly errors: ItemComposerErrors;
  readonly custoPreview: number | null;
  readonly precoUnitarioPreview: number | null;
  readonly precoTotalPreview: number | null;
  readonly onAdd: () => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const PedidoItemComposer = ({
  composer,
  setField,
  onCodigoProdutoChange,
  errors,
  custoPreview,
  precoUnitarioPreview,
  precoTotalPreview,
  onAdd,
}: PedidoItemComposerProps) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
    <h3 className="text-sm font-medium text-[var(--text-h)]">Adicionar item</h3>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TextField
        label="Código do produto"
        type="text"
        inputMode="numeric"
        value={composer.codigoProduto}
        onChange={(event) => onCodigoProdutoChange(event.target.value)}
        error={errors.codigoProduto}
      />
      <div className="flex flex-col gap-0.5 sm:col-span-2">
        <span className="text-xs font-medium text-[var(--text)]">Nome / Marca</span>
        <span className="flex h-11 items-center rounded-xl border border-[var(--border)] px-3.5 text-sm text-[var(--text-h)]">
          {composer.produtoNome ? `${composer.produtoNome} · ${composer.produtoMarca}` : '—'}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <TextField
        label="Quantidade"
        type="number"
        min={1}
        value={composer.quantidade}
        onChange={(event) => setField('quantidade', event.target.value)}
        error={errors.quantidade}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="unidade-medida-pedido" className="text-xs font-medium text-[var(--text)]">
          Unidade
        </label>
        <select
          id="unidade-medida-pedido"
          value={composer.unidadeMedida}
          onChange={(event) => setField('unidadeMedida', event.target.value as ItemComposerState['unidadeMedida'])}
          className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
        >
          {UNIDADES_MEDIDA.map((unidade) => (
            <option key={unidade} value={unidade}>
              {unidade}
            </option>
          ))}
        </select>
      </div>
      <TextField
        label="Margem (%)"
        type="text"
        inputMode="decimal"
        value={composer.margemPercentual}
        onChange={(event) => setField('margemPercentual', sanitizeDecimalInput(event.target.value))}
        error={errors.margemPercentual}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--text)]">Custo (entrada)</span>
        <span className="flex h-11 items-center text-sm tabular-nums text-[var(--text-h)]">
          {custoPreview !== null ? formatMoney(custoPreview) : '—'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--text)]">Preço unitário</span>
        <span className="flex h-11 items-center text-sm tabular-nums text-[var(--text-h)]">
          {precoUnitarioPreview !== null ? formatMoney(precoUnitarioPreview) : '—'}
        </span>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-[var(--text)]">
        Total do item:{' '}
        <strong className="text-[var(--text-h)]">
          {precoTotalPreview !== null ? formatMoney(precoTotalPreview) : '—'}
        </strong>
      </span>
      <Button type="button" variant="ghost" onClick={onAdd}>
        + Adicionar item ao pedido
      </Button>
    </div>
  </div>
);
