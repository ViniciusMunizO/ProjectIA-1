import { useState } from 'react';
import type { Cliente } from '../../../../shared/src/types/cliente.types';
import { canWrite, type UserRole } from '../../../../shared/src/types/auth.types';
import { formatCnpj } from '../../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { Button } from '../../components/ui/Button';
import { IconCrossfade } from '../../components/ui/IconCrossfade';
import { ApiRequestError } from '../../lib/api-client';
import { getClienteDocumentoUrl } from '../../lib/clientes-api';
import { ClienteEditForm } from './ClienteEditForm';

export const CLIENTE_TABLE_COLUMN_COUNT = 5;

type ClienteDetailRowProps = {
  readonly cliente: Cliente;
  readonly actorRole: UserRole | null;
  readonly onUpdated: (cliente: Cliente) => void;
};

const formatDocumento = (cliente: Cliente): string =>
  cliente.tipoDocumento === 'CPF' ? formatCpf(cliente.documento) : formatCnpj(cliente.documento);

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const Field = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-[var(--panel-muted)]">{label}</span>
    <span className="text-sm text-[var(--text-h)]">{value}</span>
  </div>
);

const StatusBadge = ({ tone, children }: { readonly tone: 'success' | 'neutral'; readonly children: string }) => {
  const toneClasses =
    tone === 'success' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--code-bg)] text-[var(--text)]';

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

const DocumentoLink = ({ clienteId }: { readonly clienteId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await getClienteDocumentoUrl(clienteId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível abrir o documento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="ghost" isLoading={isLoading} onClick={() => void handleOpen()}>
        Ver documento
      </Button>
      {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
    </div>
  );
};

export const ClienteDetailRow = ({ cliente, actorRole, onUpdated }: ClienteDetailRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Any assigned role except CONSULTA (read-only, Nível 1) may edit a
  // cliente's data.
  const canEdit = canWrite(actorRole);

  return (
    <>
      <tr
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="cursor-pointer divide-x divide-[var(--border)] border-b border-[var(--border)] text-sm hover:bg-[var(--code-bg)]"
      >
        <td className="px-4 py-3 tabular-nums text-[var(--panel-muted)]">{cliente.codigo}</td>
        <td className="px-4 py-3 font-medium text-[var(--text-h)]">{cliente.nome}</td>
        <td className="px-4 py-3 text-[var(--text)]">
          {cliente.tipoDocumento} · {formatDocumento(cliente)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge tone={cliente.temDocumentoAnexado ? 'success' : 'neutral'}>
            {cliente.temDocumentoAnexado ? 'Documento anexado' : 'Sem documento'}
          </StatusBadge>
        </td>
        <td className="px-4 py-3 text-right text-[var(--panel-muted)]">
          <IconCrossfade showFirst={!isExpanded} first={<ChevronDownIcon />} second={<ChevronUpIcon />} className="size-4" />
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={CLIENTE_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <span className="mb-3 block text-sm font-medium text-[var(--text-h)]">Editando {cliente.nome}</span>
            <ClienteEditForm
              cliente={cliente}
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
          <td colSpan={CLIENTE_TABLE_COLUMN_COUNT} className="px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Tipo de documento" value={cliente.tipoDocumento} />
                <Field label="Nome fantasia" value={cliente.nomeFantasia ?? '—'} />
                <Field label="E-mail" value={cliente.email ?? '—'} />
                <Field label="Telefone" value={cliente.telefone ?? '—'} />
                <Field label="CEP" value={cliente.cep ?? '—'} />
                <Field
                  label="Endereço"
                  value={
                    [cliente.logradouro, cliente.numero, cliente.complemento].filter(Boolean).join(', ') || '—'
                  }
                />
                <Field label="Bairro" value={cliente.bairro ?? '—'} />
                <Field
                  label="Cidade/UF"
                  value={[cliente.cidade, cliente.uf].filter(Boolean).join(' / ') || '—'}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-[var(--panel-muted)]">Documento anexado</span>
                  {cliente.temDocumentoAnexado ? (
                    <DocumentoLink clienteId={cliente.id} />
                  ) : (
                    <span className="text-sm text-[var(--text-h)]">—</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="flex flex-wrap gap-6 text-xs text-[var(--text)]">
                  <span>
                    Criado por <strong className="text-[var(--text-h)]">{cliente.createdByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(cliente.createdAt)}
                  </span>
                  <span>
                    Última alteração por{' '}
                    <strong className="text-[var(--text-h)]">{cliente.updatedByNome ?? '—'}</strong> em{' '}
                    {formatDateTime(cliente.updatedAt)}
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
