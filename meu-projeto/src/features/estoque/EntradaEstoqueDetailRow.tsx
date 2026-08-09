import { useState } from 'react';
import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';
import { IconCrossfade } from '../../components/ui/IconCrossfade';

export const ENTRADA_TABLE_COLUMN_COUNT = 5;

type EntradaEstoqueDetailRowProps = {
  readonly nota: NotaEntrada;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const ChevronDownIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
    <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
    <path d="M4 9.5 8 5.5 12 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EntradaEstoqueDetailRow = ({ nota }: EntradaEstoqueDetailRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="cursor-pointer divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm hover:bg-[var(--code-bg)]"
      >
        <td className="px-4 py-3 tabular-nums text-[var(--panel-muted)]">{nota.codigo}</td>
        <td className="px-4 py-3 font-medium text-[var(--text-h)]">{nota.fornecedorRazaoSocial}</td>
        <td className="px-4 py-3 text-[var(--text)]">{formatDate(nota.dataEmissao)}</td>
        <td className="px-4 py-3 tabular-nums text-[var(--text-h)]">{formatMoney(nota.custoTotal)}</td>
        <td className="px-4 py-3 text-right text-[var(--panel-muted)]">
          <IconCrossfade showFirst={!isExpanded} first={<ChevronDownIcon />} second={<ChevronUpIcon />} className="size-4" />
        </td>
      </tr>

      {isExpanded ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={ENTRADA_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead>
                    <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
                      <th className="px-4 py-2">Produto</th>
                      <th className="px-4 py-2">Lote</th>
                      <th className="px-4 py-2">Validade</th>
                      <th className="px-4 py-2">Un.</th>
                      <th className="px-4 py-2">Qtd.</th>
                      <th className="px-4 py-2">Custo unit.</th>
                      <th className="px-4 py-2">Custo total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nota.itens.map((item) => (
                      <tr key={item.id} className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm last:border-b-0">
                        <td className="px-4 py-2 text-[var(--text-h)]">
                          {item.produtoCodigo} · {item.produtoNome}
                          <span className="block text-xs text-[var(--text)]">{item.produtoMarca}</span>
                        </td>
                        <td className="px-4 py-2 text-[var(--text)]">{item.lote}</td>
                        <td className="px-4 py-2 text-[var(--text)]">{formatDate(item.validade)}</td>
                        <td className="px-4 py-2 text-[var(--text)]">{item.unidadeMedida}</td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text)]">{item.quantidade}</td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text)]">{formatMoney(item.custoUnitario)}</td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text-h)]">{formatMoney(item.custoTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-6 border-t border-[var(--border)] pt-3 text-xs text-[var(--text)]">
                <span>
                  Frete: <strong className="text-[var(--text-h)]">{formatMoney(nota.valorFrete)}</strong>
                </span>
                <span>
                  Desconto: <strong className="text-[var(--text-h)]">{formatMoney(nota.desconto)}</strong>
                </span>
                <span>
                  Criado por <strong className="text-[var(--text-h)]">{nota.createdByNome ?? '—'}</strong> em{' '}
                  {formatDateTime(nota.createdAt)}
                </span>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};
