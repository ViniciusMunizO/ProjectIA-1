import { useState, type FormEvent } from 'react';
import { loginSchema } from '../../../../shared/src/schemas/auth.schemas';
import { ApiRequestError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';

type FieldErrors = Partial<Record<'email' | 'senha', string>>;

export const useLoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, senha });
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({ email: flattened.email?.[0], senha: flattened.senha?.[0] });
      return false;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(parsed.data);
      return true;
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível entrar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    senha,
    setSenha,
    fieldErrors,
    formError,
    isSubmitting,
    handleSubmit,
  };
};
