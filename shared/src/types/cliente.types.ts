export type TipoDocumentoCliente = 'CPF' | 'CNPJ';

export type Cliente = {
  readonly id: string;
  readonly codigo: number;
  readonly tipoDocumento: TipoDocumentoCliente;
  readonly documento: string;
  readonly nome: string;
  readonly nomeFantasia: string | null;
  readonly email: string | null;
  readonly telefone: string | null;
  readonly cep: string | null;
  readonly logradouro: string | null;
  readonly numero: string | null;
  readonly complemento: string | null;
  readonly bairro: string | null;
  readonly cidade: string | null;
  readonly uf: string | null;
  readonly temDocumentoAnexado: boolean;
  readonly createdByNome: string | null;
  readonly createdAt: string;
  readonly updatedByNome: string | null;
  readonly updatedAt: string;
};
