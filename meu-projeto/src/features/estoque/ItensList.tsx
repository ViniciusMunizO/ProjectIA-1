import { Button } from '../../components/ui/Button';
import type { DraftItem } from './entrada-form-state';

type ItensListProps = {
  readonly itens: readonly DraftItem[];
  readonly onRemove: (localId: string) => void;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');

export const ItensList = ({ itens, onRemove }: ItensListProps) => {
  if (itens.length === 0) {
    return <p className="text-sm text-[var(--text)]">Nenhum item adicionado ainda.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Lote</th>
            <th className="px-4 py-3">Validade</th>
            <th className="px-4 py-3">Un.</th>
            <th className="px-4 py-3">Qtd.</th>
            <th className="px-4 py-3">Custo unit.</th>
            <th className="px-4 py-3">Custo total</th>
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
              <td className="px-4 py-3 text-[var(--text)]">{item.lote}</td>
              <td className="px-4 py-3 text-[var(--text)]">{formatDate(item.validade)}</td>
              <td className="px-4 py-3 text-[var(--text)]">{item.unidadeMedida}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--text)]">{item.quantidade}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--text)]">{formatMoney(item.custoUnitario)}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--text-h)]">{formatMoney(item.custoTotal)}</td>
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
