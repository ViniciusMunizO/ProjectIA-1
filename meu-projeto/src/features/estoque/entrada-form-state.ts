import type { UnidadeMedida } from '../../../../shared/src/types/entrada-estoque.types';

export type ItemComposerState = {
  readonly codigoProduto: string;
  readonly produtoId: string | null;
  readonly produtoNome: string | null;
  readonly produtoMarca: string | null;
  readonly lote: string;
  readonly dataFabricacao: string;
  readonly validade: string;
  readonly unidadeMedida: UnidadeMedida;
  readonly quantidade: string;
  readonly custoUnitario: string;
};

export const emptyItemComposer: ItemComposerState = {
  codigoProduto: '',
  produtoId: null,
  produtoNome: null,
  produtoMarca: null,
  lote: '',
  dataFabricacao: '',
  validade: '',
  unidadeMedida: 'UN',
  quantidade: '',
  custoUnitario: '',
};

export type DraftItem = {
  readonly localId: string;
  readonly produtoId: string;
  readonly produtoCodigo: number;
  readonly produtoNome: string;
  readonly produtoMarca: string;
  readonly lote: string;
  readonly dataFabricacao: string;
  readonly validade: string;
  readonly unidadeMedida: UnidadeMedida;
  readonly quantidade: number;
  readonly custoUnitario: number;
  readonly custoTotal: number;
};

export type ItemComposerErrors = Partial<
  Record<'codigoProduto' | 'lote' | 'validade' | 'quantidade' | 'custoUnitario', string>
>;
