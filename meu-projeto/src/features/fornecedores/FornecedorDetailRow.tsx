import { useState } from 'react';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { canWrite, type UserRole } from '../../../../shared/src/types/auth.types';
import { formatCnpj } from '../../../../shared/src/validators/cnpj';
import { Button } from '../../components/ui/Button';
import { IconCrossfade } from '../../components/ui/IconCrossfade';
import { FornecedorEditForm } from './FornecedorEditForm';

export const FORNECEDOR_TABLE_COLUMN_COUNT = 5;

type FornecedorDetailRowProps = {
  readonly fornecedor: Fornecedor;
  readonly actorRole: UserRole | null;
  readonly onUpdated: (fornecedor: Fornecedor) => void;
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const Field = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-[var(--panel-muted)]">{label}</span>
    <span className="text-sm text-[var(--text-h)]">{value}</span>
  </div>
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

export const FornecedorDetailRow = ({ fornecedor, actorRole, onUpdated }: FornecedorDetailRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Any assigned role except CONSULTA (read-only, Nível 1) may edit a
  // fornecedor's data.
  const canEdit = canWrite(actorRole);

  return (
    <>
      <tr
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="cursor-pointer divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm hover:bg-[var(--code-bg)]"
      >
        <td className="px-4 py-3 tabular-nums text-[var(--panel-muted)]">{fornecedor.codigo}</td>
        <td className="px-4 py-3 font-medium text-[var(--text-h)]">{fornecedor.razaoSocial}</td>
        <td className="px-4 py-3 text-[var(--text)]">{formatCnpj(fornecedor.cnpj)}</td>
        <td className="px-4 py-3 text-[var(--text)]">
          {[fornecedor.cidade, fornecedor.uf].filter(Boolean).join(' / ') || '—'}
        </td>
        <td className="px-4 py-3 text-right text-[var(--panel-muted)]">
          <IconCrossfade showFirst={!isExpanded} first={<ChevronDownIcon />} second={<ChevronUpIcon />} className="size-4" />
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={FORNECEDOR_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <span className="mb-3 block text-sm font-medium text-[var(--text-h)]">
              Editando {fornecedor.razaoSocial}
            </span>
            <FornecedorEditForm
              fornecedor={fornecedor}
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
          <td colSpan={FORNECEDOR_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Nome fantasia" value={fornecedor.nomeFantasia ?? '—'} />
                <Field label="CEP" value={fornecedor.cep ?? '—'} />
                <Field
                  label="Endereço"
                  value={
                    [fornecedor.logradouro, fornecedor.numero, fornecedor.complemento].filter(Boolean).join(', ') ||
                    '—'
                  }
                />
                <Field label="Bairro" value={fornecedor.bairro ?? '—'} />
                <Field
                  label="Cidade/UF"
                  value={[fornecedor.cidade, fornecedor.uf].filter(Boolean).join(' / ') || '—'}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="flex flex-wrap gap-6 text-xs text-[var(--text)]">
                  <span>
                    Criado por{' '}
                    <strong className="text-[var(--text-h)]">{fornecedor.createdByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(fornecedor.createdAt)}
                  </span>
                  <span>
                    Última alteração por{' '}
                    <strong className="text-[var(--text-h)]">{fornecedor.updatedByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(fornecedor.updatedAt)}
                  </span>
                </div>

                {canEdit ? (
                  <Button variant="ghost" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};
