import { useState, type FormEvent } from 'react';
import { cadastroSchema } from '../../../../shared/src/schemas/cadastro.schemas';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { formatPhoneBR } from '../../../../shared/src/validators/phone-br';
import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types';
import { ApiRequestError } from '../../lib/api-client';
import { createCadastro } from '../../lib/cadastro-api';
import { validateCadastroFile } from '../../lib/file-validation';

type FieldErrors = Partial<Record<'nome' | 'cpf' | 'email' | 'telefone' | 'arquivo', string>>;

type UseCadastroFormOptions = {
  readonly onSuccess: (record: CadastroRecord) => void;
};

export const useCadastroForm = ({ onSuccess }: UseCadastroFormOptions) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCpfChange = (value: string): void => setCpf(formatCpf(value));
  const handleTelefoneChange = (value: string): void => setTelefone(formatPhoneBR(value));

  const handleFileChange = (nextFile: File | null): void => {
    if (!nextFile) {
      setFile(null);
      setFieldErrors((current) => ({ ...current, arquivo: undefined }));
      return;
    }

    const result = validateCadastroFile(nextFile);
    if (!result.valid) {
      setFile(null);
      setFieldErrors((current) => ({ ...current, arquivo: result.reason }));
      return;
    }

    setFile(nextFile);
    setFieldErrors((current) => ({ ...current, arquivo: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = cadastroSchema.safeParse({ nome, cpf, email, telefone });
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nome: flattened.nome?.[0],
        cpf: flattened.cpf?.[0],
        email: flattened.email?.[0],
        telefone: flattened.telefone?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { cadastro } = await createCadastro(parsed.data);
      onSuccess(cadastro);
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setFile(null);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar o cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    nome,
    setNome,
    cpf,
    handleCpfChange,
    email,
    setEmail,
    telefone,
    handleTelefoneChange,
    file,
    handleFileChange,
    fieldErrors,
    formError,
    isSubmitting,
    handleSubmit,
  };
};
