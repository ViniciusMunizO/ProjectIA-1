type Level = {
  readonly nivel: string;
  readonly papel: string;
  readonly descricao: string;
};

const LEVELS: readonly Level[] = [
  { nivel: '0', papel: 'Sem permissão', descricao: 'Conta recém-criada, aguardando um papel ser atribuído. Sem acesso a nada.' },
  { nivel: '1', papel: 'Consulta', descricao: 'Somente visualização e pesquisa — não pode cadastrar, editar ou excluir nada.' },
  { nivel: '2', papel: 'Funcionário', descricao: 'Cadastro e edição completos (clientes, produtos, fornecedores, estoque, pedidos). Sem acesso a Usuários.' },
  { nivel: '3', papel: 'Farmacêutico', descricao: 'Mesmo que Funcionário, com a exclusividade de auditar produtos.' },
  { nivel: '4', papel: 'Gerente / Administrador', descricao: 'Controle total, incluindo atribuir e remover o papel de outros usuários.' },
];

export const PermissionLevelsLegend = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
    <h2 className="text-sm font-medium text-[var(--text-h)]">Níveis de permissão</h2>
    <div className="flex flex-col gap-2.5">
      {LEVELS.map((level) => (
        <div key={level.nivel} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 inline-flex h-6 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--code-bg)] text-xs font-medium tabular-nums text-[var(--text-h)]">
            Nível {level.nivel}
          </span>
          <span className="text-[var(--text)]">
            <strong className="font-medium text-[var(--text-h)]">{level.papel}</strong> — {level.descricao}
          </span>
        </div>
      ))}
    </div>
  </div>
);
