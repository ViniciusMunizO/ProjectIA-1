import { useState, type FormEvent } from 'react';
import { fornecedorSchema } from '../../../../shared/src/schemas/fornecedor.schemas';
import { formatCnpj, normalizeCnpj } from '../../../../shared/src/validators/cnpj';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { ApiRequestError } from '../../lib/api-client';
import { lookupCnpjFornecedor, updateFornecedor } from '../../lib/fornecedores-api';
import {
  flattenFornecedorFieldErrors,
  fornecedorToFormFields,
  type FornecedorFieldErrors,
  type FornecedorFormFieldsState,
} from './fornecedor-form-state';

type UseFornecedorEditFormOptions = {
  readonly fornecedor: Fornecedor;
  readonly onSuccess: (fornecedor: Fornecedor) => void;
};

export const useFornecedorEditForm = ({ fornecedor, onSuccess }: UseFornecedorEditFormOptions) => {
  const [fields, setFields] = useState<FornecedorFormFieldsState>(() => fornecedorToFormFields(fornecedor));
  const [fieldErrors, setFieldErrors] = useState<FornecedorFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);

  const setField = <K extends keyof FornecedorFormFieldsState>(key: K, value: FornecedorFormFieldsState[K]): void =>
    setFields((current) => ({ ...current, [key]: value }));

  const handleCnpjChange = (value: string): void => setField('cnpj', formatCnpj(value));

  const handleCnpjLookup = async (): Promise<void> => {
    const cnpj = normalizeCnpj(fields.cnpj);
    if (cnpj.length !== 14) {
      setFieldErrors((current) => ({ ...current, cnpj: 'Informe um CNPJ completo para buscar' }));
      return;
    }

    setIsLookingUpCnpj(true);
    setFormError(null);
    try {
      const dados = await lookupCnpjFornecedor(cnpj);
      setFields((current) => ({
        ...current,
        razaoSocial: dados.razaoSocial || current.razaoSocial,
        nomeFantasia: dados.nomeFantasia ?? current.nomeFantasia,
        cep: dados.cep ?? current.cep,
        logradouro: dados.logradouro ?? current.logradouro,
        numero: dados.numero ?? current.numero,
        complemento: dados.complemento ?? current.complemento,
        bairro: dados.bairro ?? current.bairro,
        cidade: dados.cidade ?? current.cidade,
        uf: dados.uf ?? current.uf,
      }));
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível consultar o CNPJ');
    } finally {
      setIsLookingUpCnpj(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = fornecedorSchema.safeParse(fields);
    if (!parsed.success) {
      setFieldErrors(flattenFornecedorFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { fornecedor: updated } = await updateFornecedor(fornecedor.id, parsed.data);
      onSuccess(updated);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar as alterações');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fields,
    setField,
    handleCnpjChange,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  };
};
