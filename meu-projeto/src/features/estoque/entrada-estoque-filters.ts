import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';
import { stripAccents } from '../../../../shared/src/validators/text-normalize';

export type EntradaEstoqueFilters = {
  readonly busca: string;
  readonly dataInicio: string;
  readonly dataFim: string;
};

export const EMPTY_ENTRADA_ESTOQUE_FILTERS: EntradaEstoqueFilters = {
  busca: '',
  dataInicio: '',
  dataFim: '',
};

export const filterEntradasEstoque = (
  notas: readonly NotaEntrada[],
  filters: EntradaEstoqueFilters,
): NotaEntrada[] => {
  let result = [...notas];

  if (filters.busca.trim()) {
    const needle = stripAccents(filters.busca.trim().toLowerCase());
    result = result.filter((nota) => {
      const haystacks = [
        nota.fornecedorRazaoSocial,
        String(nota.codigo),
        ...nota.itens.flatMap((item) => [item.produtoNome, item.produtoMarca, String(item.produtoCodigo)]),
      ];
      return haystacks.some((field) => stripAccents(field.toLowerCase()).includes(needle));
    });
  }

  // dataEmissao is an ISO "YYYY-MM-DD" string, so lexicographic comparison
  // sorts the same as chronological order — no Date parsing needed.
  if (filters.dataInicio) {
    result = result.filter((nota) => nota.dataEmissao >= filters.dataInicio);
  }
  if (filters.dataFim) {
    result = result.filter((nota) => nota.dataEmissao <= filters.dataFim);
  }

  return result;
};
