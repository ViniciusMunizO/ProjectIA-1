import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { TextField } from '../../components/ui/TextField';
import { sanitizeDecimalInput } from '../../lib/decimal-input';
import { FornecedorForm } from '../fornecedores/FornecedorForm';
import { ItemComposer } from './ItemComposer';
import { ItensList } from './ItensList';
import { useEntradaEstoqueForm } from './useEntradaEstoqueForm';

type EntradaEstoqueFormProps = {
  readonly onSuccess: (nota: NotaEntrada) => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const EntradaEstoqueForm = ({ onSuccess }: EntradaEstoqueFormProps) => {
  const {
    isLoadingOptions,
    optionsError,
    fornecedores,
    fornecedorId,
    setFornecedorId,
    isAddingFornecedor,
    setIsAddingFornecedor,
    handleFornecedorCreated,
    composer,
    setComposerField,
    handleCodigoProdutoChange,
    composerErrors,
    custoTotalComposer,
    handleAddItem,
    itens,
    handleRemoveItem,
    custoTotalNota,
    valorFrete,
    setValorFrete,
    desconto,
    setDesconto,
    formError,
    isSubmitting,
    handleSubmit,
  } = useEntradaEstoqueForm({ onSuccess });

  if (isLoadingOptions) {
    return <Spinner className="size-5 text-[var(--text)]" />;
  }

  if (optionsError) {
    return <p className="text-sm text-[var(--danger)]">{optionsError}</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <h3 className="text-sm font-medium text-[var(--text-h)]">Fornecedor</h3>

        {isAddingFornecedor ? (
          <div className="flex flex-col gap-3">
            <FornecedorForm
              onSuccess={(fornecedor) => {
                handleFornecedorCreated(fornecedor);
              }}
            />
            <Button type="button" variant="ghost" className="w-fit" onClick={() => setIsAddingFornecedor(false)}>
              Cancelar novo fornecedor
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-64 flex-1">
              <label htmlFor="fornecedor" className="text-xs font-medium text-[var(--text)]">
                Fornecedor cadastrado
              </label>
              <select
                id="fornecedor"
                value={fornecedorId}
                onChange={(event) => setFornecedorId(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">Selecione...</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.codigo} · {fornecedor.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" variant="ghost" onClick={() => setIsAddingFornecedor(true)}>
              + Novo fornecedor
            </Button>
          </div>
        )}
      </div>

      <ItemComposer
        composer={composer}
        setField={setComposerField}
        onCodigoProdutoChange={handleCodigoProdutoChange}
        errors={composerErrors}
        custoTotal={custoTotalComposer}
        onAdd={handleAddItem}
      />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[var(--text-h)]">Itens da nota</h3>
        <ItensList itens={itens} onRemove={handleRemoveItem} />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-[var(--text)]">Custo total da nota</span>
          <span className="text-lg font-medium tabular-nums text-[var(--text-h)]">{formatMoney(custoTotalNota)}</span>
        </div>
        <TextField
          label="Valor do frete"
          type="text"
          inputMode="decimal"
          value={valorFrete}
          onChange={(event) => setValorFrete(sanitizeDecimalInput(event.target.value))}
        />
        <TextField
          label="Desconto (opcional)"
          type="text"
          inputMode="decimal"
          value={desconto}
          onChange={(event) => setDesconto(sanitizeDecimalInput(event.target.value))}
        />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="w-fit">
        OK — Finalizar nota
      </Button>
    </form>
  );
};
