import { Button } from '../../components/ui/Button';
import type { DraftItem } from './pedido-form-state';

type PedidoItensListProps = {
  readonly itens: readonly DraftItem[];
  readonly onRemove: (localId: string) => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const PedidoItensList = ({ itens, onRemove }: PedidoItensListProps) => {
  if (itens.length === 0) {
    return <p className="text-sm text-[var(--text)]">Nenhum item adicionado ainda.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Qtd.</th>
            <th className="px-4 py-3">Un.</th>
            <th className="px-4 py-3">Margem</th>
            <th className="px-4 py-3">Preço unit.</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.localId} className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm">
              <td className="px-4 py-3 text-[var(--text-h)]">
                {item.produtoCodigo} · {item.produtoNome}
                <span className="block text-xs text-[var(--text)]">{item.produtoMarca}</span>
              </td>
              <td className="px-4 py-3 tabular-nums text-[var(--text)]">{item.quantidade}</td>
              <td className="px-4 py-3 text-[var(--text)]">{item.unidadeMedida}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--text)]">
                {item.margemPercentual.toLocaleString('pt-BR')}%
              </td>
              <td className="px-4 py-3 tabular-nums text-[var(--text)]">{formatMoney(item.precoUnitario)}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--text-h)]">{formatMoney(item.precoTotal)}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" onClick={() => onRemove(item.localId)}>
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
