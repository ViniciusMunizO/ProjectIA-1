import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';

export type ProdutoCusto = {
  readonly custoUnidade: number;
  readonly custoCaixa: number;
};

// There's no cost field on produtos itself — cost only exists as line items
// on notas_entrada_itens. For each produto this takes the most recently
// registered entrada item (by the nota's createdAt) and normalizes it to
// both a per-unit and a per-caixa figure, since an item can have been
// entered in either unidade_medida.
export const computeCustosPorProduto = (
  entradas: readonly NotaEntrada[],
  quantidadeCaixaPorProduto: ReadonlyMap<string, number>,
): ReadonlyMap<string, ProdutoCusto> => {
  const latestByProduto = new Map<string, { createdAt: string; custo: ProdutoCusto }>();

  for (const nota of entradas) {
    for (const item of nota.itens) {
      const existing = latestByProduto.get(item.produtoId);
      if (existing && existing.createdAt >= nota.createdAt) {
        continue;
      }

      const quantidadeCaixa = quantidadeCaixaPorProduto.get(item.produtoId) ?? 1;
      const custo: ProdutoCusto =
        item.unidadeMedida === 'CX'
          ? { custoCaixa: item.custoUnitario, custoUnidade: item.custoUnitario / quantidadeCaixa }
          : { custoUnidade: item.custoUnitario, custoCaixa: item.custoUnitario * quantidadeCaixa };

      latestByProduto.set(item.produtoId, { createdAt: nota.createdAt, custo });
    }
  }

  const result = new Map<string, ProdutoCusto>();
  for (const [produtoId, { custo }] of latestByProduto) {
    result.set(produtoId, custo);
  }
  return result;
};
