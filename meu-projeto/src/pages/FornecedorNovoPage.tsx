import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { FornecedorForm } from '../features/fornecedores/FornecedorForm';
import { useAuth } from '../hooks/useAuth';

export const FornecedorNovoPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-[var(--bg)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text)]">Olá, {user?.nome}</span>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-balance text-3xl font-medium tracking-tight text-[var(--text-h)]">
              Novo fornecedor
            </h1>
            <p className="text-pretty text-sm text-[var(--text)]">
              Preencha os dados abaixo para cadastrar um fornecedor.
            </p>
          </div>
          <Link
            to="/fornecedores"
            className="text-sm font-medium text-[var(--accent)] underline underline-offset-2"
          >
            Ver listagem
          </Link>
        </div>

        <FornecedorForm
          onSuccess={() => {
            navigate('/fornecedores', { state: { successMessage: 'Cadastro concluído.' } });
          }}
        />
      </main>
    </div>
  );
};
