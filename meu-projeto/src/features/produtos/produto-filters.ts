import { stripAccents } from '../../../../shared/src/validators/text-normalize';
import type { CategoriaProduto, Produto } from '../../../../shared/src/types/produto.types';

export type AuditadoFilter = 'TODOS' | 'AUDITADO' | 'NAO_AUDITADO';
export type ControladoFilter = 'TODOS' | 'SIM' | 'NAO';

export type ProdutoFilters = {
  readonly busca: string;
  readonly categoria: CategoriaProduto | 'TODAS';
  readonly auditado: AuditadoFilter;
  readonly controlado: ControladoFilter;
};

export const EMPTY_FILTERS: ProdutoFilters = {
  busca: '',
  categoria: 'TODAS',
  auditado: 'TODOS',
  controlado: 'TODOS',
};

const matchesBusca = (produto: Produto, busca: string): boolean => {
  if (!busca) {
    return true;
  }

  // Stored text already has accents stripped (see produto.schemas.ts), so
  // the query is normalized the same way to keep matching consistent
  // regardless of how the person typed it.
  const needle = stripAccents(busca.trim().toLowerCase());
  const haystacks = [
    produto.nome,
    produto.nomeComercial,
    produto.marca,
    produto.descricao ?? '',
    produto.codigoBarras,
    produto.ean ?? '',
    produto.registroAnvisa ?? '',
    String(produto.codigo),
  ];

  return haystacks.some((field) => stripAccents(field.toLowerCase()).includes(needle));
};

export const filterProdutos = (produtos: readonly Produto[], filters: ProdutoFilters): Produto[] =>
  produtos.filter((produto) => {
    if (!matchesBusca(produto, filters.busca)) {
      return false;
    }
    if (filters.categoria !== 'TODAS' && produto.categoria !== filters.categoria) {
      return false;
    }
    if (filters.auditado === 'AUDITADO' && !produto.auditado) {
      return false;
    }
    if (filters.auditado === 'NAO_AUDITADO' && produto.auditado) {
      return false;
    }
    if (filters.controlado === 'SIM' && !produto.controlado) {
      return false;
    }
    if (filters.controlado === 'NAO' && produto.controlado) {
      return false;
    }
    return true;
  });
