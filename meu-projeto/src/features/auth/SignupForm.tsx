import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useSignupForm } from './useSignupForm';

type SignupFormProps = {
  readonly onSwitchToLogin: () => void;
};

export const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const {
    nome,
    setNome,
    email,
    setEmail,
    senha,
    setSenha,
    chaveAcesso,
    setChaveAcesso,
    fieldErrors,
    formError,
    isSubmitting,
    passwordCheck,
    handleSubmit,
  } = useSignupForm();

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        tone="panel"
        label="Nome"
        type="text"
        autoComplete="name"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        error={fieldErrors.nome}
      />
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
        autoComplete="new-password"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
        error={fieldErrors.senha}
      />

      <PasswordStrengthMeter result={passwordCheck} hasValue={senha.length > 0} />

      <TextField
        tone="panel"
        label="Chave de acesso"
        type="text"
        autoComplete="off"
        placeholder="8 caracteres"
        maxLength={8}
        value={chaveAcesso}
        onChange={(event) => setChaveAcesso(event.target.value)}
        error={fieldErrors.chaveAcesso}
      />
      <p className="-mt-2 text-xs text-[var(--panel-muted)]">
        Peça a chave de acesso vigente a um administrador.
      </p>

      {formError ? (
        <p role="alert" className="text-xs text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="panel"
        isLoading={isSubmitting}
        disabled={senha.length > 0 && !passwordCheck.valid}
        className="mt-1 w-fit"
      >
        Criar conta
      </Button>

      <p className="text-xs text-[var(--panel-muted)]">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="relative inline-block py-1 font-medium text-[var(--panel-text)] underline underline-offset-2 transition-opacity duration-150 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:opacity-80"
        >
          Entrar
        </button>
      </p>
    </form>
  );
};
