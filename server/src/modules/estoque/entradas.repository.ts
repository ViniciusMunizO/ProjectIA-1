import type { NotaEntrada, NotaEntradaItem, UnidadeMedida } from '../../../../shared/src/types/entrada-estoque.types.js';
import { supabase, unwrap } from '../../db/supabase.js';

type NotaEntradaItemRow = {
  id: string;
  produto_id: string;
  lote: string;
  data_fabricacao: string | null;
  validade: string;
  unidade_medida: UnidadeMedida;
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
  produtos: { codigo: number; nome: string; marca: string } | null;
};

type NotaEntradaRow = {
  id: string;
  codigo: number;
  fornecedor_id: string;
  data_emissao: string;
  valor_frete: number;
  desconto: number;
  custo_total: number;
  created_by: string | null;
  created_at: string;
  fornecedores: { razao_social: string } | null;
  notas_entrada_itens: NotaEntradaItemRow[];
};

const NOTA_ENTRADA_SELECT = `
  id, codigo, fornecedor_id, data_emissao, valor_frete, desconto, custo_total, created_by, created_at,
  fornecedores ( razao_social ),
  notas_entrada_itens (
    id, produto_id, lote, data_fabricacao, validade, unidade_medida, quantidade, custo_unitario, custo_total,
    produtos ( codigo, nome, marca )
  )
`;

const toNotaEntradaItem = (row: NotaEntradaItemRow): NotaEntradaItem => ({
  id: row.id,
  produtoId: row.produto_id,
  produtoCodigo: row.produtos?.codigo ?? 0,
  produtoNome: row.produtos?.nome ?? '—',
  produtoMarca: row.produtos?.marca ?? '—',
  lote: row.lote,
  dataFabricacao: row.data_fabricacao,
  validade: row.validade,
  unidadeMedida: row.unidade_medida,
  quantidade: row.quantidade,
  custoUnitario: row.custo_unitario,
  custoTotal: row.custo_total,
});

const toNotaEntrada = (row: NotaEntradaRow, nomeById: ReadonlyMap<string, string>): NotaEntrada => ({
  id: row.id,
  codigo: row.codigo,
  fornecedorId: row.fornecedor_id,
  fornecedorRazaoSocial: row.fornecedores?.razao_social ?? '—',
  dataEmissao: row.data_emissao,
  valorFrete: row.valor_frete,
  desconto: row.desconto,
  custoTotal: row.custo_total,
  itens: row.notas_entrada_itens.map(toNotaEntradaItem),
  createdByNome: row.created_by ? (nomeById.get(row.created_by) ?? null) : null,
  createdAt: row.created_at,
});

export type NovaEntradaEstoqueItemInput = {
  readonly produtoId: string;
  readonly lote: string;
  readonly dataFabricacao?: string;
  readonly validade: string;
  readonly unidadeMedida: UnidadeMedida;
  readonly quantidade: number;
  readonly custoUnitario: number;
};

export type NovaEntradaEstoqueInput = {
  readonly fornecedorId: string;
  readonly valorFrete: number;
  readonly desconto: number;
  readonly itens: readonly NovaEntradaEstoqueItemInput[];
};

// The whole note (header + every item + the produtos.quantidade_estoque
// increments) is created by a single Postgres function call, so it commits
// or fails as one transaction — see fn_create_entrada_estoque in the
// migration. There is no equivalent multi-table transaction primitive in
// the supabase-js query builder, so this is the RPC escape hatch used
// deliberately, not by default.
export const insertEntradaEstoque = async (
  input: NovaEntradaEstoqueInput,
  createdBy: string,
): Promise<string> => {
  const notaId = unwrap(
    await supabase.rpc('fn_create_entrada_estoque', {
      p_fornecedor_id: input.fornecedorId,
      p_valor_frete: input.valorFrete,
      p_desconto: input.desconto,
      p_created_by: createdBy,
      p_itens: input.itens.map((item) => ({
        produto_id: item.produtoId,
        lote: item.lote,
        data_fabricacao: item.dataFabricacao ?? null,
        validade: item.validade,
        unidade_medida: item.unidadeMedida,
        quantidade: item.quantidade,
        custo_unitario: item.custoUnitario,
      })),
    }),
  ) as string;

  return notaId;
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

export const findEntradaEstoqueById = async (id: string): Promise<NotaEntrada | null> => {
  const { data, error } = await supabase.from('notas_entrada').select(NOTA_ENTRADA_SELECT).eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as unknown as NotaEntradaRow;
  const nomeById = await resolveNomeById(row.created_by ? [row.created_by] : []);
  return toNotaEntrada(row, nomeById);
};

export const listEntradasEstoque = async (): Promise<NotaEntrada[]> => {
  const rows = unwrap(
    await supabase.from('notas_entrada').select(NOTA_ENTRADA_SELECT).order('created_at', { ascending: false }),
  ) as unknown as NotaEntradaRow[];

  const ids = rows.map((row) => row.created_by).filter((id): id is string => Boolean(id));
  const nomeById = await resolveNomeById(ids);

  return rows.map((row) => toNotaEntrada(row, nomeById));
};
