import type { UnidadeMedida } from './entrada-estoque.types.js';

export const TIPOS_PEDIDO = ['ORCAMENTO', 'PEDIDO'] as const;

export type TipoPedido = (typeof TIPOS_PEDIDO)[number];

export type PedidoItem = {
  readonly id: string;
  readonly produtoId: string;
  readonly produtoCodigo: number;
  readonly produtoNome: string;
  readonly produtoMarca: string;
  readonly quantidade: number;
  readonly unidadeMedida: UnidadeMedida;
  readonly custoUnitario: number;
  readonly margemPercentual: number;
  readonly precoUnitario: number;
  readonly precoTotal: number;
};

export type Pedido = {
  readonly id: string;
  readonly codigo: number;
  readonly numeroPedido: string | null;
  readonly tipo: TipoPedido;
  readonly clienteId: string;
  readonly clienteNome: string;
  readonly clienteDocumento: string;
  readonly clienteTipoDocumento: 'CPF' | 'CNPJ';
  readonly clienteEndereco: string | null;
  readonly observacoes: string | null;
  readonly valorTotal: number;
  readonly dataEmissao: string;
  readonly itens: readonly PedidoItem[];
  readonly createdByNome: string | null;
  readonly createdAt: string;
};
