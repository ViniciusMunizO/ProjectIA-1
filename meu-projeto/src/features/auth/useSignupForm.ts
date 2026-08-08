import { useMemo, useState, type FormEvent } from 'react';
import { checkPasswordStrength } from '../../../../shared/src/validators/password-policy';
import { signupSchema } from '../../../../shared/src/schemas/auth.schemas';
import { ApiRequestError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';

type FieldErrors = Partial<Record<'nome' | 'email' | 'senha' | 'chaveAcesso', string>>;

export const useSignupForm = () => {
  const { signup } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordCheck = useMemo(
    () => checkPasswordStrength(senha, { nome, email }),
    [senha, nome, email],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse({ nome, email, senha, chaveAcesso });
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nome: flattened.nome?.[0],
        email: flattened.email?.[0],
        senha: flattened.senha?.[0],
        chaveAcesso: flattened.chaveAcesso?.[0],
      });
      return false;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await signup(parsed.data);
      return true;
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível criar a conta');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
