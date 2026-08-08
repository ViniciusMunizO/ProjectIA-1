import { useState, type FormEvent } from 'react';
import { clienteSchema } from '../../../../shared/src/schemas/cliente.schemas';
import { formatCnpj, normalizeCnpj } from '../../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { formatPhoneBR } from '../../../../shared/src/validators/phone-br';
import type { Cliente, TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types';
import { ApiRequestError } from '../../lib/api-client';
import { createCliente, lookupCnpj } from '../../lib/clientes-api';
import { validateClienteDocumento } from '../../lib/file-validation';
import {
  emptyClienteForm,
  flattenClienteFieldErrors,
  type ClienteFieldErrors,
  type ClienteFormFieldsState,
} from './cliente-form-state';

type UseClienteFormOptions = {
  readonly onSuccess: (cliente: Cliente, documentoUploadFailed: boolean) => void;
};

export const useClienteForm = ({ onSuccess }: UseClienteFormOptions) => {
  const [fields, setFields] = useState<ClienteFormFieldsState>(emptyClienteForm);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoError, setArquivoError] = useState<string | undefined>(undefined);
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

  const handleFileChange = (nextFile: File | null): void => {
    if (!nextFile) {
      setArquivo(null);
      setArquivoError(undefined);
      return;
    }

    const result = validateClienteDocumento(nextFile);
    if (!result.valid) {
      setArquivo(null);
      setArquivoError(result.reason);
      return;
    }

    setArquivo(nextFile);
    setArquivoError(undefined);
  };

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
      const { cliente, documentoUploadFailed } = await createCliente(parsed.data, arquivo);
      onSuccess(cliente, documentoUploadFailed);
      setFields(emptyClienteForm);
      setArquivo(null);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar o cliente');
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
    arquivo,
    handleFileChange,
    arquivoError,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  };
};
