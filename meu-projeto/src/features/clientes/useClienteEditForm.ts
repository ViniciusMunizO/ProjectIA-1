import { useState, type FormEvent } from 'react';
import { clienteSchema } from '../../../../shared/src/schemas/cliente.schemas';
import { formatCnpj, normalizeCnpj } from '../../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { formatPhoneBR } from '../../../../shared/src/validators/phone-br';
import type { Cliente, TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types';
import { ApiRequestError } from '../../lib/api-client';
import { lookupCnpj, updateCliente } from '../../lib/clientes-api';
import {
  clienteToFormFields,
  flattenClienteFieldErrors,
  type ClienteFieldErrors,
  type ClienteFormFieldsState,
} from './cliente-form-state';

type UseClienteEditFormOptions = {
  readonly cliente: Cliente;
  readonly onSuccess: (cliente: Cliente) => void;
};

export const useClienteEditForm = ({ cliente, onSuccess }: UseClienteEditFormOptions) => {
  const [fields, setFields] = useState<ClienteFormFieldsState>(() => clienteToFormFields(cliente));
  const [fieldErrors, setFieldErrors] = useState<ClienteFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);

  const setField = <K extends keyof ClienteFormFieldsState>(key: K, value: ClienteFormFieldsState[K]): void =>
    setFields((current) => ({ ...current, [key]: value }));

  const handleTipoDocumentoChange = (next: TipoDocumentoCliente): void =>
    setFields((current) => ({ ...current, tipoDocumento: next, documento: '' }));

  const handleDocumentoChange = (value: string): void =>
    setFields((current) => ({
      ...current,
      documento: current.tipoDocumento === 'CPF' ? formatCpf(value) : formatCnpj(value),
    }));

  const handleTelefoneChange = (value: string): void => setField('telefone', formatPhoneBR(value));

  const handleCnpjLookup = async (): Promise<void> => {
    const cnpj = normalizeCnpj(fields.documento);
    if (cnpj.length !== 14) {
      setFieldErrors((current) => ({ ...current, documento: 'Informe um CNPJ completo para buscar' }));
      return;
    }

    setIsLookingUpCnpj(true);
    setFormError(null);
    try {
      const dados = await lookupCnpj(cnpj);
      setFields((current) => ({
        ...current,
        nome: dados.razaoSocial || current.nome,
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

    const parsed = clienteSchema.safeParse(fields);
    if (!parsed.success) {
      setFieldErrors(flattenClienteFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { cliente: updated } = await updateCliente(cliente.id, parsed.data);
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
    handleTipoDocumentoChange,
    handleDocumentoChange,
    handleTelefoneChange,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  };
};
