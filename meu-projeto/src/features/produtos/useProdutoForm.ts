import { useState, type FormEvent } from 'react';
import { produtoSchema } from '../../../../shared/src/schemas/produto.schemas';
import type { Produto } from '../../../../shared/src/types/produto.types';
import { ApiRequestError } from '../../lib/api-client';
import { createProduto } from '../../lib/produtos-api';
import { emptyProdutoForm, flattenProdutoFieldErrors, type ProdutoFieldErrors } from './produto-form-state';

type UseProdutoFormOptions = {
  readonly onSuccess: (produto: Produto) => void;
};

export const useProdutoForm = ({ onSuccess }: UseProdutoFormOptions) => {
  const [fields, setFields] = useState(emptyProdutoForm);
  const [fieldErrors, setFieldErrors] = useState<ProdutoFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof typeof emptyProdutoForm>(key: K, value: (typeof emptyProdutoForm)[K]): void =>
    setFields((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = produtoSchema.safeParse(fields);
    if (!parsed.success) {
      setFieldErrors(flattenProdutoFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { produto } = await createProduto(parsed.data);
      onSuccess(produto);
      setFields(emptyProdutoForm);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar o produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { fields, setField, fieldErrors, formError, isSubmitting, handleSubmit };
};
