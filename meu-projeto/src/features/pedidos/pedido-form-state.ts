import type { UnidadeMedida } from '../../../../shared/src/types/entrada-estoque.types';

export type ItemComposerState = {
  readonly codigoProduto: string;
  readonly produtoId: string | null;
  readonly produtoNome: string | null;
  readonly produtoMarca: string | null;
  readonly quantidade: string;
  readonly unidadeMedida: UnidadeMedida;
  readonly margemPercentual: string;
};

export const emptyItemComposer = (margemPadrao: string): ItemComposerState => ({
  codigoProduto: '',
  produtoId: null,
  produtoNome: null,
  produtoMarca: null,
  quantidade: '',
  unidadeMedida: 'UN',
  margemPercentual: margemPadrao,
});

export type DraftItem = {
  readonly localId: string;
  readonly produtoId: string;
  readonly produtoCodigo: number;
  readonly produtoNome: string;
  readonly produtoMarca: string;
  readonly quantidade: number;
  readonly unidadeMedida: UnidadeMedida;
  readonly margemPercentual: number;
  readonly custoUnitario: number;
  readonly precoUnitario: number;
  readonly precoTotal: number;
};

export type ItemComposerErrors = Partial<Record<'codigoProduto' | 'quantidade' | 'margemPercentual', string>>;
