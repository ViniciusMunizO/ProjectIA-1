import { useState } from 'react';
import type { Produto } from '../../../../shared/src/types/produto.types';
import type { UserRole } from '../../../../shared/src/types/auth.types';
import { Button } from '../../components/ui/Button';
import { IconCrossfade } from '../../components/ui/IconCrossfade';
import { anvisaConsultaUrl, categoriaLabel } from '../../lib/produto-labels';
import { ProdutoEditForm } from './ProdutoEditForm';
import type { ProdutoCusto } from './produto-custos';

export const PRODUTO_TABLE_COLUMN_COUNT = 9;

type ProdutoDetailCardProps = {
  readonly produto: Produto;
  readonly custo: ProdutoCusto | undefined;
  readonly actorRole: UserRole | null;
  readonly onToggleAuditado: (id: string, auditado: boolean) => Promise<boolean>;
  readonly onUpdated: (produto: Produto) => void;
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCaixas = (quantidadeEstoque: number, quantidadeCaixa: number): string =>
  (quantidadeEstoque / quantidadeCaixa).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

const Field = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-[var(--panel-muted)]">{label}</span>
    <span className="text-sm text-[var(--text-h)]">{value}</span>
  </div>
);

const StatusBadge = ({ tone, children }: { readonly tone: 'success' | 'danger' | 'neutral'; readonly children: string }) => {
  const toneClasses =
    tone === 'success'
      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
      : tone === 'danger'
        ? 'bg-[var(--danger-bg)] text-[var(--danger)]'
        : 'bg-[var(--code-bg)] text-[var(--text)]';

  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
};

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

export const ProdutoDetailCard = ({ produto, custo, actorRole, onToggleAuditado, onUpdated }: ProdutoDetailCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const canAudit = actorRole === 'ADMIN' || actorRole === 'FARMACEUTICO';
  // Any staff member with an assigned role may edit a product's general
  // data; the auditado toggle above is the one action still gated to
  // ADMIN/FARMACEUTICO per the Fase 3 business rule.
  const canEdit = actorRole !== null;

  return (
    <>
      <tr
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="cursor-pointer divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm hover:bg-[var(--code-bg)]"
      >
        <td className="px-4 py-3 tabular-nums text-[var(--panel-muted)]">{produto.codigo}</td>
        <td className="px-4 py-3 font-medium text-[var(--text-h)]">{produto.nome}</td>
        <td className="px-4 py-3 text-[var(--text)]">{produto.marca}</td>
        <td className="px-4 py-3 tabular-nums text-[var(--text)]">{produto.quantidadeCaixa}</td>
        <td className="px-4 py-3 tabular-nums text-[var(--text)]">{produto.quantidadeEstoque}</td>
        <td className="px-4 py-3 tabular-nums text-[var(--text)]">
          {formatCaixas(produto.quantidadeEstoque, produto.quantidadeCaixa)}
        </td>
        <td className="px-4 py-3 tabular-nums text-[var(--text)]">
          {custo ? formatMoney(custo.custoUnidade) : '—'}
        </td>
        <td className="px-4 py-3 tabular-nums text-[var(--text)]">{custo ? formatMoney(custo.custoCaixa) : '—'}</td>
        <td className="px-4 py-3 text-right text-[var(--panel-muted)]">
          <IconCrossfade showFirst={!isExpanded} first={<ChevronDownIcon />} second={<ChevronUpIcon />} className="size-4" />
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={PRODUTO_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <span className="mb-3 block text-sm font-medium text-[var(--text-h)]">Editando {produto.nome}</span>
            <ProdutoEditForm
              produto={produto}
              onCancel={() => setIsEditing(false)}
              onSuccess={(updated) => {
                onUpdated(updated);
                setIsEditing(false);
              }}
            />
          </td>
        </tr>
      ) : isExpanded ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={PRODUTO_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={produto.auditado ? 'success' : 'danger'}>
                  {produto.auditado ? 'Auditado' : 'Não auditado'}
                </StatusBadge>
                {produto.controlado ? <StatusBadge tone="neutral">Controlado</StatusBadge> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Nome comercial" value={produto.nomeComercial} />
                <Field label="Marca" value={produto.marca} />
                <Field label="Categoria" value={categoriaLabel(produto.categoria)} />
                <Field label="Código de barras" value={produto.codigoBarras} />
                <Field label="EAN" value={produto.ean ?? '—'} />
                {produto.registroAnvisa ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[var(--panel-muted)]">Registro ANVISA</span>
                    <a
                      href={anvisaConsultaUrl(produto.registroAnvisa)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-sm text-[var(--accent)] underline underline-offset-2"
                    >
                      {produto.registroAnvisa}
                    </a>
                  </div>
                ) : (
                  <Field label="Registro ANVISA" value="—" />
                )}
                <Field label="Quantidade na caixa" value={String(produto.quantidadeCaixa)} />
                <Field label="Em estoque" value={`${produto.quantidadeEstoque} UN`} />
              </div>

              <Field label="Descrição" value={produto.descricao ?? '—'} />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="flex flex-wrap gap-6 text-xs text-[var(--text)]">
                  <span>
                    Criado por <strong className="text-[var(--text-h)]">{produto.createdByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(produto.createdAt)}
                  </span>
                  <span>
                    Última alteração por{' '}
                    <strong className="text-[var(--text-h)]">{produto.updatedByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(produto.updatedAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canEdit ? (
                    <Button variant="ghost" onClick={() => setIsEditing(true)}>
                      Editar
                    </Button>
                  ) : null}
                  {canAudit ? (
                    <Button variant="ghost" onClick={() => void onToggleAuditado(produto.id, !produto.auditado)}>
                      {produto.auditado ? 'Marcar não auditado' : 'Marcar auditado'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};
