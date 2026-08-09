import { useState } from 'react';
import type { Pedido } from '../../../../shared/src/types/pedido.types';
import { formatCnpj } from '../../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { Button } from '../../components/ui/Button';
import { IconCrossfade } from '../../components/ui/IconCrossfade';
import { generatePedidoPdf } from '../../lib/pedido-pdf';

export const PEDIDO_TABLE_COLUMN_COUNT = 6;

type PedidoDetailRowProps = {
  readonly pedido: Pedido;
};

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const formatDocumento = (documento: string, tipo: 'CPF' | 'CNPJ'): string =>
  tipo === 'CNPJ' ? formatCnpj(documento) : formatCpf(documento);

const StatusBadge = ({ tone, children }: { readonly tone: 'success' | 'neutral'; readonly children: string }) => (
  <span
    className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${
      tone === 'success' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--code-bg)] text-[var(--text)]'
    }`}
  >
    {children}
  </span>
);

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

export const PedidoDetailRow = ({ pedido }: PedidoDetailRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = async (): Promise<void> => {
    setIsGeneratingPdf(true);
    try {
      await generatePedidoPdf(pedido);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <tr
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="cursor-pointer divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm hover:bg-[var(--code-bg)]"
      >
        <td className="px-4 py-3 tabular-nums text-[var(--panel-muted)]">{pedido.codigo}</td>
        <td className="px-4 py-3 font-medium text-[var(--text-h)]">{pedido.clienteNome}</td>
        <td className="px-4 py-3">
          <StatusBadge tone={pedido.tipo === 'PEDIDO' ? 'success' : 'neutral'}>
            {pedido.tipo === 'PEDIDO' ? 'Pedido' : 'Orçamento'}
          </StatusBadge>
        </td>
        <td className="px-4 py-3 text-[var(--text)]">{formatDate(pedido.dataEmissao)}</td>
        <td className="px-4 py-3 tabular-nums text-[var(--text-h)]">{formatMoney(pedido.valorTotal)}</td>
        <td className="px-4 py-3 text-right text-[var(--panel-muted)]">
          <IconCrossfade showFirst={!isExpanded} first={<ChevronDownIcon />} second={<ChevronUpIcon />} className="size-4" />
        </td>
      </tr>

      {isExpanded ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={PEDIDO_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-[var(--panel-muted)]">Cliente</span>
                  <span className="text-sm text-[var(--text-h)]">
                    {pedido.clienteNome} — {formatDocumento(pedido.clienteDocumento, pedido.clienteTipoDocumento)}
                  </span>
                </div>
                {pedido.numeroPedido ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[var(--panel-muted)]">Número do pedido</span>
                    <span className="text-sm text-[var(--text-h)]">{pedido.numeroPedido}</span>
                  </div>
                ) : null}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead>
                    <tr className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--panel-muted)]">
                      <th className="px-4 py-2">Produto</th>
                      <th className="px-4 py-2">Qtd.</th>
                      <th className="px-4 py-2">Un.</th>
                      <th className="px-4 py-2">Margem</th>
                      <th className="px-4 py-2">Preço unit.</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map((item) => (
                      <tr key={item.id} className="divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm last:border-b-0">
                        <td className="px-4 py-2 text-[var(--text-h)]">
                          {item.produtoCodigo} · {item.produtoNome}
                          <span className="block text-xs text-[var(--text)]">{item.produtoMarca}</span>
                        </td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text)]">{item.quantidade}</td>
                        <td className="px-4 py-2 text-[var(--text)]">{item.unidadeMedida}</td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text)]">
                          {item.margemPercentual.toLocaleString('pt-BR')}%
                        </td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text)]">{formatMoney(item.precoUnitario)}</td>
                        <td className="px-4 py-2 tabular-nums text-[var(--text-h)]">{formatMoney(item.precoTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pedido.observacoes ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-[var(--panel-muted)]">Observações</span>
                  <span className="text-sm text-[var(--text-h)]">{pedido.observacoes}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <span className="text-xs text-[var(--text)]">
                  Criado por <strong className="text-[var(--text-h)]">{pedido.createdByNome ?? '—'}</strong> em{' '}
                  {formatDateTime(pedido.createdAt)}
                </span>
                <Button variant="ghost" isLoading={isGeneratingPdf} onClick={() => void handlePrint()}>
                  Imprimir
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};
