export type Fornecedor = {
  readonly id: string;
  readonly codigo: number;
  readonly cnpj: string;
  readonly razaoSocial: string;
  readonly nomeFantasia: string | null;
  readonly cep: string | null;
  readonly logradouro: string | null;
  readonly numero: string | null;
  readonly complemento: string | null;
  readonly bairro: string | null;
  readonly cidade: string | null;
  readonly uf: string | null;
  readonly createdByNome: string | null;
  readonly createdAt: string;
  readonly updatedByNome: string | null;
  readonly updatedAt: string;
};
