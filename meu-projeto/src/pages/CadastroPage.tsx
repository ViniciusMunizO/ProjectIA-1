import { Button } from '../components/ui/Button';
import { ToastViewport } from '../components/ui/ToastViewport';
import { CadastroForm } from '../features/cadastro/CadastroForm';
import { CadastroList } from '../features/cadastro/CadastroList';
import { useCadastroList } from '../features/cadastro/useCadastroList';
import { useAuth } from '../hooks/useAuth';
import { useToasts } from '../hooks/useToasts';

export const CadastroPage = () => {
  const { user, logout } = useAuth();
  const { records, isLoading, addRecord } = useCadastroList();
  const { toasts, pushToast, dismissToast } = useToasts();

  return (
    <div className="min-h-svh bg-[var(--bg)]">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <span className="text-sm font-semibold tracking-tight text-[var(--text-h)]">
          meu-projeto
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text)]">Olá, {user?.nome}</span>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">
            Novo cadastro
          </h1>
          <p className="text-pretty text-sm text-[var(--text)]">
            Preencha os dados abaixo para registrar um novo cadastro.
          </p>
        </div>

        <CadastroForm
          onSuccess={(record) => {
            addRecord(record);
            pushToast('Cadastro salvo com sucesso.', 'success');
          }}
        />

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-[var(--text-h)]">Seus cadastros</h2>
          <CadastroList records={records} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};
