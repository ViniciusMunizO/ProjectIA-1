export const UNIDADES_MEDIDA = ['CX', 'UN'] as const;

export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number];

export type NotaEntradaItem = {
  readonly id: string;
  readonly produtoId: string;
  readonly produtoCodigo: number;
  readonly produtoNome: string;
  readonly produtoMarca: string;
  readonly lote: string;
  readonly dataFabricacao: string | null;
  readonly validade: string;
  readonly unidadeMedida: UnidadeMedida;
  readonly quantidade: number;
  readonly custoUnitario: number;
  readonly custoTotal: number;
};

export type NotaEntrada = {
  readonly id: string;
  readonly codigo: number;
  readonly fornecedorId: string;
  readonly fornecedorRazaoSocial: string;
  readonly dataEmissao: string;
  readonly valorFrete: number;
  readonly desconto: number;
  readonly custoTotal: number;
  readonly itens: readonly NotaEntradaItem[];
  readonly createdByNome: string | null;
  readonly createdAt: string;
};
