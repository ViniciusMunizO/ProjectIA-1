import type { Cliente, TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types';
import { formatCnpj } from '../../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../../shared/src/validators/cpf';
import { formatPhoneBR } from '../../../../shared/src/validators/phone-br';

export type ClienteFormFieldsState = {
  readonly tipoDocumento: TipoDocumentoCliente;
  readonly documento: string;
  readonly nome: string;
  readonly nomeFantasia: string;
  readonly email: string;
  readonly telefone: string;
  readonly cep: string;
  readonly logradouro: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
};

export type ClienteFieldErrors = Partial<
  Record<
    | 'documento'
    | 'nome'
    | 'nomeFantasia'
    | 'email'
    | 'telefone'
    | 'cep'
    | 'logradouro'
    | 'numero'
    | 'complemento'
    | 'bairro'
    | 'cidade'
    | 'uf',
    string
  >
>;

export const emptyClienteForm: ClienteFormFieldsState = {
  tipoDocumento: 'CPF',
  documento: '',
  nome: '',
  nomeFantasia: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export const clienteToFormFields = (cliente: Cliente): ClienteFormFieldsState => ({
  tipoDocumento: cliente.tipoDocumento,
  documento: cliente.tipoDocumento === 'CPF' ? formatCpf(cliente.documento) : formatCnpj(cliente.documento),
  nome: cliente.nome,
  nomeFantasia: cliente.nomeFantasia ?? '',
  email: cliente.email ?? '',
  telefone: cliente.telefone ? formatPhoneBR(cliente.telefone) : '',
  cep: cliente.cep ?? '',
  logradouro: cliente.logradouro ?? '',
  numero: cliente.numero ?? '',
  complemento: cliente.complemento ?? '',
  bairro: cliente.bairro ?? '',
  cidade: cliente.cidade ?? '',
  uf: cliente.uf ?? '',
});

export const flattenClienteFieldErrors = (
  fieldErrors: Partial<Record<string, readonly string[] | undefined>>,
): ClienteFieldErrors => ({
  documento: fieldErrors.documento?.[0],
  nome: fieldErrors.nome?.[0],
  nomeFantasia: fieldErrors.nomeFantasia?.[0],
  email: fieldErrors.email?.[0],
  telefone: fieldErrors.telefone?.[0],
  cep: fieldErrors.cep?.[0],
  logradouro: fieldErrors.logradouro?.[0],
  numero: fieldErrors.numero?.[0],
  complemento: fieldErrors.complemento?.[0],
  bairro: fieldErrors.bairro?.[0],
  cidade: fieldErrors.cidade?.[0],
  uf: fieldErrors.uf?.[0],
});
