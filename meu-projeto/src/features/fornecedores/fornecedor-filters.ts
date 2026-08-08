import { stripAccents } from '../../../../shared/src/validators/text-normalize';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';

export type FornecedorFilters = {
  readonly busca: string;
};

export const EMPTY_FORNECEDOR_FILTERS: FornecedorFilters = { busca: '' };

export const filterFornecedores = (
  fornecedores: readonly Fornecedor[],
  filters: FornecedorFilters,
): Fornecedor[] => {
  if (!filters.busca) {
    return [...fornecedores];
  }

  // Stored free text already has accents stripped (see fornecedor.schemas.ts),
  // so the query is normalized the same way to keep matching consistent
  // regardless of how the person typed it.
  const needle = stripAccents(filters.busca.trim().toLowerCase());

  return fornecedores.filter((fornecedor) => {
    const haystacks = [
      fornecedor.razaoSocial,
      fornecedor.nomeFantasia ?? '',
      fornecedor.cnpj,
      fornecedor.cidade ?? '',
      String(fornecedor.codigo),
    ];
    return haystacks.some((field) => stripAccents(field.toLowerCase()).includes(needle));
  });
};
