import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { formatCnpj } from '../../../../shared/src/validators/cnpj';

export type FornecedorFormFieldsState = {
  readonly cnpj: string;
  readonly razaoSocial: string;
  readonly nomeFantasia: string;
  readonly cep: string;
  readonly logradouro: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
};

export type FornecedorFieldErrors = Partial<
  Record<
    'cnpj' | 'razaoSocial' | 'nomeFantasia' | 'cep' | 'logradouro' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'uf',
    string
  >
>;

export const emptyFornecedorForm: FornecedorFormFieldsState = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export const fornecedorToFormFields = (fornecedor: Fornecedor): FornecedorFormFieldsState => ({
  cnpj: formatCnpj(fornecedor.cnpj),
  razaoSocial: fornecedor.razaoSocial,
  nomeFantasia: fornecedor.nomeFantasia ?? '',
  cep: fornecedor.cep ?? '',
  logradouro: fornecedor.logradouro ?? '',
  numero: fornecedor.numero ?? '',
  complemento: fornecedor.complemento ?? '',
  bairro: fornecedor.bairro ?? '',
  cidade: fornecedor.cidade ?? '',
  uf: fornecedor.uf ?? '',
});

export const flattenFornecedorFieldErrors = (
  fieldErrors: Partial<Record<string, readonly string[] | undefined>>,
): FornecedorFieldErrors => ({
  cnpj: fieldErrors.cnpj?.[0],
  razaoSocial: fieldErrors.razaoSocial?.[0],
  nomeFantasia: fieldErrors.nomeFantasia?.[0],
  cep: fieldErrors.cep?.[0],
  logradouro: fieldErrors.logradouro?.[0],
  numero: fieldErrors.numero?.[0],
  complemento: fieldErrors.complemento?.[0],
  bairro: fieldErrors.bairro?.[0],
  cidade: fieldErrors.cidade?.[0],
  uf: fieldErrors.uf?.[0],
});
