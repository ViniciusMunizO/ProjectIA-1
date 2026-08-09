import type { Pedido } from '../../../../shared/src/types/pedido.types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { TextField } from '../../components/ui/TextField';
import { sanitizeDecimalInput } from '../../lib/decimal-input';
import { PedidoItemComposer } from './PedidoItemComposer';
import { PedidoItensList } from './PedidoItensList';
import { usePedidoForm } from './usePedidoForm';

type PedidoFormProps = {
  readonly onSuccess: (pedido: Pedido) => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const PedidoForm = ({ onSuccess }: PedidoFormProps) => {
  const {
    isLoadingOptions,
    optionsError,
    clientes,
    tipo,
    setTipo,
    clienteId,
    setClienteId,
    numeroPedido,
    setNumeroPedido,
    observacoes,
    setObservacoes,
    margemPadrao,
    setMargemPadrao,
    composer,
    setComposerField,
    handleCodigoProdutoChange,
    composerErrors,
    custoPreview,
    precoUnitarioPreview,
    precoTotalPreview,
    handleAddItem,
    itens,
    handleRemoveItem,
    valorTotal,
    formError,
    isSubmitting,
    handleSubmit,
  } = usePedidoForm({ onSuccess });

  if (isLoadingOptions) {
    return <Spinner className="size-5 text-[var(--text)]" />;
  }

  if (optionsError) {
    return <p className="text-sm text-[var(--danger)]">{optionsError}</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-pedido" className="text-xs font-medium text-[var(--text)]">
              Tipo
            </label>
            <select
              id="tipo-pedido"
              value={tipo}
              onChange={(event) => setTipo(event.target.value as typeof tipo)}
              className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
            >
              <option value="ORCAMENTO">Orçamento (não movimenta estoque)</option>
              <option value="PEDIDO">Pedido (baixa estoque ao salvar)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cliente-pedido" className="text-xs font-medium text-[var(--text)]">
              Cliente
            </label>
            <select
              id="cliente-pedido"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">Selecione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.codigo} · {cliente.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Número do pedido (opcional)"
            type="text"
            value={numeroPedido}
            onChange={(event) => setNumeroPedido(event.target.value)}
          />
          <TextField
            label="Margem padrão (%)"
            type="text"
            inputMode="decimal"
            value={margemPadrao}
            onChange={(event) => {
              const sanitized = sanitizeDecimalInput(event.target.value);
              setMargemPadrao(sanitized);
              setComposerField('margemPercentual', sanitized);
            }}
          />
        </div>
      </div>

      <PedidoItemComposer
        composer={composer}
        setField={setComposerField}
        onCodigoProdutoChange={handleCodigoProdutoChange}
        errors={composerErrors}
        custoPreview={custoPreview}
        precoUnitarioPreview={precoUnitarioPreview}
        precoTotalPreview={precoTotalPreview}
        onAdd={handleAddItem}
      />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[var(--text-h)]">Itens do pedido</h3>
        <PedidoItensList itens={itens} onRemove={handleRemoveItem} />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="observacoes-pedido" className="text-xs font-medium text-[var(--text)]">
            Observações (opcional)
          </label>
          <textarea
            id="observacoes-pedido"
            rows={3}
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-[var(--text)]">Valor total</span>
          <span className="text-lg font-medium tabular-nums text-[var(--text-h)]">{formatMoney(valorTotal)}</span>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="w-fit">
        OK — Finalizar {tipo === 'PEDIDO' ? 'pedido' : 'orçamento'}
      </Button>
    </form>
  );
};
