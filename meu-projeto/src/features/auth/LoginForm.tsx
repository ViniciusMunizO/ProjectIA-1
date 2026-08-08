import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useLoginForm } from './useLoginForm';

type LoginFormProps = {
  readonly onSwitchToSignup: () => void;
};

export const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const { email, setEmail, senha, setSenha, fieldErrors, formError, isSubmitting, handleSubmit } =
    useLoginForm();

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        tone="panel"
        label="E-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />
      <TextField
        tone="panel"
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
        error={fieldErrors.senha}
      />

      {formError ? (
        <p role="alert" className="text-xs text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="panel" isLoading={isSubmitting} className="mt-1 w-fit">
        Entrar
      </Button>

      <p className="text-xs text-[var(--panel-muted)]">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="relative inline-block py-1 font-medium text-[var(--panel-text)] underline underline-offset-2 transition-opacity duration-150 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:opacity-80"
        >
          Cadastre-se
        </button>
      </p>
    </form>
  );
};
