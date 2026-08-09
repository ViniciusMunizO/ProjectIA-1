export const CATEGORIAS_PRODUTO = ['MEDICAMENTO', 'MATERIAL_HOSPITALAR', 'OUTROS'] as const;

export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];

export type Produto = {
  readonly id: string;
  readonly codigo: number;
  readonly nome: string;
  readonly nomeComercial: string;
  readonly marca: string;
  readonly descricao: string | null;
  readonly categoria: CategoriaProduto;
  readonly ean: string | null;
  readonly registroAnvisa: string | null;
  readonly codigoBarras: string;
  readonly quantidadeCaixa: number;
  readonly controlado: boolean;
  readonly auditado: boolean;
  readonly quantidadeEstoque: number;
  readonly createdByNome: string | null;
  readonly createdAt: string;
  readonly updatedByNome: string | null;
  readonly updatedAt: string;
};
