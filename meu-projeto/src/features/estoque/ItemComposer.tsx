import { UNIDADES_MEDIDA } from '../../../../shared/src/types/entrada-estoque.types';
import { Button } from '../../components/ui/Button';
import { DateField } from '../../components/ui/DateField';
import { TextField } from '../../components/ui/TextField';
import { sanitizeDecimalInput } from '../../lib/decimal-input';
import type { ItemComposerErrors, ItemComposerState } from './entrada-form-state';

type ItemComposerProps = {
  readonly composer: ItemComposerState;
  readonly setField: <K extends keyof ItemComposerState>(key: K, value: ItemComposerState[K]) => void;
  readonly onCodigoProdutoChange: (value: string) => void;
  readonly errors: ItemComposerErrors;
  readonly custoTotal: number;
  readonly onAdd: () => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ItemComposer = ({ composer, setField, onCodigoProdutoChange, errors, custoTotal, onAdd }: ItemComposerProps) => (
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

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TextField
        label="Lote"
        type="text"
        value={composer.lote}
        onChange={(event) => setField('lote', event.target.value)}
        error={errors.lote}
      />
      <DateField
        label="Data de fabricação (opcional)"
        value={composer.dataFabricacao}
        onChange={(isoValue) => setField('dataFabricacao', isoValue)}
      />
      <DateField
        label="Validade"
        value={composer.validade}
        onChange={(isoValue) => setField('validade', isoValue)}
        error={errors.validade}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="unidade-medida" className="text-xs font-medium text-[var(--text)]">
          Unidade
        </label>
        <select
          id="unidade-medida"
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
        label="Quantidade"
        type="number"
        min={1}
        value={composer.quantidade}
        onChange={(event) => setField('quantidade', event.target.value)}
        error={errors.quantidade}
      />
      <TextField
        label="Custo unitário"
        type="text"
        inputMode="decimal"
        value={composer.custoUnitario}
        onChange={(event) => setField('custoUnitario', sanitizeDecimalInput(event.target.value))}
        error={errors.custoUnitario}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-[var(--text)]">Custo total do item</span>
        <span className="flex h-11 items-center text-sm tabular-nums text-[var(--text-h)]">
          {formatMoney(custoTotal)}
        </span>
      </div>
    </div>

    <Button type="button" variant="ghost" onClick={onAdd} className="w-fit">
      + Adicionar item à nota
    </Button>
  </div>
);
