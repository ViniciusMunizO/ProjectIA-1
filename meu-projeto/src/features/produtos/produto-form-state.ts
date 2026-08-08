import type { CategoriaProduto, Produto } from '../../../../shared/src/types/produto.types';

export type ProdutoFormFieldsState = {
  readonly nome: string;
  readonly nomeComercial: string;
  readonly marca: string;
  readonly descricao: string;
  readonly categoria: CategoriaProduto | '';
  readonly ean: string;
  readonly registroAnvisa: string;
  readonly codigoBarras: string;
  readonly quantidadeCaixa: string;
  readonly controlado: boolean;
};

export type ProdutoFieldErrors = Partial<
  Record<
    | 'nome'
    | 'nomeComercial'
    | 'marca'
    | 'descricao'
    | 'categoria'
    | 'ean'
    | 'registroAnvisa'
    | 'codigoBarras'
    | 'quantidadeCaixa',
    string
  >
>;

export const emptyProdutoForm: ProdutoFormFieldsState = {
  nome: '',
  nomeComercial: '',
  marca: '',
  descricao: '',
  categoria: '',
  ean: '',
  registroAnvisa: '',
  codigoBarras: '',
  quantidadeCaixa: '',
  controlado: false,
};

export const produtoToFormFields = (produto: Produto): ProdutoFormFieldsState => ({
  nome: produto.nome,
  nomeComercial: produto.nomeComercial,
  marca: produto.marca,
  descricao: produto.descricao ?? '',
  categoria: produto.categoria,
  ean: produto.ean ?? '',
  registroAnvisa: produto.registroAnvisa ?? '',
  codigoBarras: produto.codigoBarras,
  quantidadeCaixa: String(produto.quantidadeCaixa),
  controlado: produto.controlado,
});

export const flattenProdutoFieldErrors = (
  fieldErrors: Partial<Record<string, readonly string[] | undefined>>,
): ProdutoFieldErrors => ({
  nome: fieldErrors.nome?.[0],
  nomeComercial: fieldErrors.nomeComercial?.[0],
  marca: fieldErrors.marca?.[0],
  descricao: fieldErrors.descricao?.[0],
  categoria: fieldErrors.categoria?.[0],
  ean: fieldErrors.ean?.[0],
  registroAnvisa: fieldErrors.registroAnvisa?.[0],
  codigoBarras: fieldErrors.codigoBarras?.[0],
  quantidadeCaixa: fieldErrors.quantidadeCaixa?.[0],
});
