import type { CategoriaProduto, Produto } from '../../../../shared/src/types/produto.types.js';
import { supabase, unwrap } from '../../db/supabase.js';

type ProdutoRow = {
  id: string;
  codigo: number;
  nome: string;
  nome_comercial: string;
  marca: string;
  descricao: string | null;
  categoria: CategoriaProduto;
  ean: string | null;
  registro_anvisa: string | null;
  codigo_barras: string;
  quantidade_caixa: number;
  controlado: boolean;
  auditado: boolean;
  quantidade_estoque: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
};

const PRODUTO_COLUMNS =
  'id, codigo, nome, nome_comercial, marca, descricao, categoria, ean, registro_anvisa, codigo_barras, quantidade_caixa, controlado, auditado, quantidade_estoque, created_by, created_at, updated_by, updated_at';

export type NovoProdutoInput = {
  readonly nome: string;
  readonly nomeComercial: string;
  readonly marca: string;
  readonly descricao?: string;
  readonly categoria: CategoriaProduto;
  readonly ean?: string;
  readonly registroAnvisa?: string;
  readonly codigoBarras: string;
  readonly quantidadeCaixa: number;
  readonly controlado: boolean;
};

const resolveNomeById = async (ids: readonly string[]): Promise<ReadonlyMap<string, string>> => {
  const distinctIds = [...new Set(ids)];
  if (distinctIds.length === 0) {
    return new Map();
  }

  const rows = unwrap(await supabase.from('users').select('id, nome').in('id', distinctIds)) as Array<{
    id: string;
    nome: string;
  }>;

  return new Map(rows.map((row) => [row.id, row.nome]));
};

const toProduto = (row: ProdutoRow, nomeById: ReadonlyMap<string, string>): Produto => ({
  id: row.id,
  codigo: row.codigo,
  nome: row.nome,
  nomeComercial: row.nome_comercial,
  marca: row.marca,
  descricao: row.descricao,
  categoria: row.categoria,
  ean: row.ean,
  registroAnvisa: row.registro_anvisa,
  codigoBarras: row.codigo_barras,
  quantidadeCaixa: row.quantidade_caixa,
  controlado: row.controlado,
  auditado: row.auditado,
  quantidadeEstoque: row.quantidade_estoque,
  createdByNome: row.created_by ? (nomeById.get(row.created_by) ?? null) : null,
  createdAt: row.created_at,
  updatedByNome: row.updated_by ? (nomeById.get(row.updated_by) ?? null) : null,
  updatedAt: row.updated_at,
});

export const insertProduto = async (input: NovoProdutoInput, createdBy: string): Promise<Produto> => {
  const row = unwrap(
    await supabase
      .from('produtos')
      .insert({
        nome: input.nome,
        nome_comercial: input.nomeComercial,
        marca: input.marca,
        descricao: input.descricao ?? null,
        categoria: input.categoria,
        ean: input.ean ?? null,
        registro_anvisa: input.registroAnvisa ?? null,
        codigo_barras: input.codigoBarras,
        quantidade_caixa: input.quantidadeCaixa,
        controlado: input.controlado,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .select(PRODUTO_COLUMNS)
      .single(),
  ) as ProdutoRow;

  const nomeById = await resolveNomeById([createdBy]);
  return toProduto(row, nomeById);
};

export type ProdutoAuditadoStatus = { readonly nome: string; readonly auditado: boolean };

// Used by modules that consume produtos by id (Entrada de Estoque today) to
// enforce the Fase 3.1 rule server-side — the caller supplies a produtoId,
// but whether it may actually be used is server state, not something the
// client's own search filter can be trusted to have gotten right.
export const findProdutosAuditadoStatus = async (
  ids: readonly string[],
): Promise<ReadonlyMap<string, ProdutoAuditadoStatus>> => {
  const distinctIds = [...new Set(ids)];
  if (distinctIds.length === 0) {
    return new Map();
  }

  const rows = unwrap(
    await supabase.from('produtos').select('id, nome, auditado').in('id', distinctIds),
  ) as Array<{ id: string; nome: string; auditado: boolean }>;

  return new Map(rows.map((row) => [row.id, { nome: row.nome, auditado: row.auditado }]));
};

export const listProdutos = async (): Promise<Produto[]> => {
  const rows = unwrap(
    await supabase.from('produtos').select(PRODUTO_COLUMNS).order('created_at', { ascending: false }),
  ) as ProdutoRow[];

  const ids = rows.flatMap((row) => [row.created_by, row.updated_by].filter((id): id is string => Boolean(id)));
  const nomeById = await resolveNomeById(ids);

  return rows.map((row) => toProduto(row, nomeById));
};

export const findProdutoById = async (id: string): Promise<Produto | null> => {
  const { data, error } = await supabase.from('produtos').select(PRODUTO_COLUMNS).eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const nomeById = await resolveNomeById([data.created_by, data.updated_by].filter((id): id is string => Boolean(id)));
  return toProduto(data as ProdutoRow, nomeById);
};

export const updateProduto = async (
  id: string,
  input: NovoProdutoInput,
  updatedBy: string,
): Promise<Produto | null> => {
  const { data, error } = await supabase
    .from('produtos')
    .update({
      nome: input.nome,
      nome_comercial: input.nomeComercial,
      marca: input.marca,
      descricao: input.descricao ?? null,
      categoria: input.categoria,
      ean: input.ean ?? null,
      registro_anvisa: input.registroAnvisa ?? null,
      codigo_barras: input.codigoBarras,
      quantidade_caixa: input.quantidadeCaixa,
      controlado: input.controlado,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(PRODUTO_COLUMNS)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as ProdutoRow;
  const nomeById = await resolveNomeById(
    [row.created_by, row.updated_by].filter((rowId): rowId is string => Boolean(rowId)),
  );
  return toProduto(row, nomeById);
};

export const setProdutoAuditado = async (
  id: string,
  auditado: boolean,
  updatedBy: string,
): Promise<void> => {
  const { error } = await supabase
    .from('produtos')
    .update({ auditado, updated_by: updatedBy, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
};
