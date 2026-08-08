// Shared between any module that registers an entity by CNPJ (clientes,
// fornecedores, ...): the shape returned by the public CNPJ lookup.
export type CnpjLookupResult = {
  readonly razaoSocial: string;
  readonly nomeFantasia: string | null;
  readonly cep: string | null;
  readonly logradouro: string | null;
  readonly numero: string | null;
  readonly complemento: string | null;
  readonly bairro: string | null;
  readonly cidade: string | null;
  readonly uf: string | null;
};
