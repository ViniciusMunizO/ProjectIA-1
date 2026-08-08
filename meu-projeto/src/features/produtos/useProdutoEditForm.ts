import { useState, type FormEvent } from 'react';
import { produtoSchema } from '../../../../shared/src/schemas/produto.schemas';
import type { Produto } from '../../../../shared/src/types/produto.types';
import { ApiRequestError } from '../../lib/api-client';
import { updateProduto } from '../../lib/produtos-api';
import { flattenProdutoFieldErrors, produtoToFormFields, type ProdutoFieldErrors } from './produto-form-state';

type UseProdutoEditFormOptions = {
  readonly produto: Produto;
  readonly onSuccess: (produto: Produto) => void;
};

export const useProdutoEditForm = ({ produto, onSuccess }: UseProdutoEditFormOptions) => {
  const [fields, setFields] = useState(() => produtoToFormFields(produto));
  const [fieldErrors, setFieldErrors] = useState<ProdutoFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof ReturnType<typeof produtoToFormFields>>(
    key: K,
    value: ReturnType<typeof produtoToFormFields>[K],
  ): void => setFields((current) => ({ ...current, [key]: value }));

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
      const { produto: updated } = await updateProduto(produto.id, parsed.data);
      onSuccess(updated);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar as alterações');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { fields, setField, fieldErrors, formError, isSubmitting, handleSubmit };
};
