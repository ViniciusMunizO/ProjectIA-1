import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { formatPhoneBR } from '../../../../shared/src/validators/phone-br';

type CadastroListProps = {
  readonly records: readonly CadastroRecord[];
  readonly isLoading: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const CadastroList = ({ records, isLoading }: CadastroListProps) => {
  if (isLoading) {
    return <p className="text-sm text-[var(--text)]">Carregando cadastros...</p>;
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-[var(--text)]">Nenhum cadastro enviado ainda.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record) => (
        <li
          key={record.id}
          className="animate-fade-in-up rounded-xl border border-[var(--border)] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[var(--text-h)]">{record.nome}</span>
            <span className="tabular-nums text-xs text-[var(--text)]">
              {dateFormatter.format(new Date(record.createdAt))}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--text)]">
            <span>CPF: {formatCpf(record.cpf)}</span>
            <span>{record.email}</span>
            <span>{formatPhoneBR(record.telefone)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
