import type { UnidadeMedida } from '../../../../shared/src/types/entrada-estoque.types.js';
import type { Pedido, PedidoItem, TipoPedido } from '../../../../shared/src/types/pedido.types.js';
import { supabase, unwrap } from '../../db/supabase.js';

type PedidoItemRow = {
  id: string;
  produto_id: string;
  quantidade: number;
  unidade_medida: UnidadeMedida;
  custo_unitario: number;
  margem_percentual: number;
  preco_unitario: number;
  preco_total: number;
  produtos: { codigo: number; nome: string; marca: string } | null;
};

type PedidoClienteRow = {
  nome: string;
  tipo_documento: 'CPF' | 'CNPJ';
  documento: string;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
};

type PedidoRow = {
  id: string;
  codigo: number;
  numero_pedido: string | null;
  tipo: TipoPedido;
  cliente_id: string;
  observacoes: string | null;
  valor_total: number;
  data_emissao: string;
  created_by: string | null;
  created_at: string;
  clientes: PedidoClienteRow | null;
  pedidos_itens: PedidoItemRow[];
};

const PEDIDO_SELECT = `
  id, codigo, numero_pedido, tipo, cliente_id, observacoes, valor_total, data_emissao, created_by, created_at,
  clientes ( nome, tipo_documento, documento, logradouro, numero, complemento, bairro, cidade, uf ),
  pedidos_itens (
    id, produto_id, quantidade, unidade_medida, custo_unitario, margem_percentual, preco_unitario, preco_total,
    produtos ( codigo, nome, marca )
  )
`;

const formatEndereco = (cliente: PedidoClienteRow | null): string | null => {
  if (!cliente) {
    return null;
  }
  const partes = [
    [cliente.logradouro, cliente.numero].filter(Boolean).join(', '),
    cliente.complemento,
    cliente.bairro,
    [cliente.cidade, cliente.uf].filter(Boolean).join(' / '),
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(' — ') : null;
};

const toPedidoItem = (row: PedidoItemRow): PedidoItem => ({
  id: row.id,
  produtoId: row.produto_id,
  produtoCodigo: row.produtos?.codigo ?? 0,
  produtoNome: row.produtos?.nome ?? '—',
  produtoMarca: row.produtos?.marca ?? '—',
  quantidade: row.quantidade,
  unidadeMedida: row.unidade_medida,
  custoUnitario: row.custo_unitario,
  margemPercentual: row.margem_percentual,
  precoUnitario: row.preco_unitario,
  precoTotal: row.preco_total,
});

const toPedido = (row: PedidoRow, nomeById: ReadonlyMap<string, string>): Pedido => ({
  id: row.id,
  codigo: row.codigo,
  numeroPedido: row.numero_pedido,
  tipo: row.tipo,
  clienteId: row.cliente_id,
  clienteNome: row.clientes?.nome ?? '—',
  clienteDocumento: row.clientes?.documento ?? '—',
  clienteTipoDocumento: row.clientes?.tipo_documento ?? 'CPF',
  clienteEndereco: formatEndereco(row.clientes),
  observacoes: row.observacoes,
  valorTotal: row.valor_total,
  dataEmissao: row.data_emissao,
  itens: row.pedidos_itens.map(toPedidoItem),
  createdByNome: row.created_by ? (nomeById.get(row.created_by) ?? null) : null,
  createdAt: row.created_at,
});

export type NovoPedidoItemInput = {
  readonly produtoId: string;
  readonly quantidade: number;
  readonly unidadeMedida: UnidadeMedida;
  readonly margemPercentual: number;
};

export type NovoPedidoInput = {
  readonly tipo: TipoPedido;
  readonly clienteId: string;
  readonly numeroPedido?: string;
  readonly observacoes?: string;
  readonly itens: readonly NovoPedidoItemInput[];
};

// The whole pedido (header + every item +, for tipo PEDIDO, the
// produtos.quantidade_estoque decrements) is created by a single Postgres
// function call, so it commits or fails as one transaction — see
// fn_create_pedido in the migration. Cost is looked up inside that function
// from the produto's most recent entrada de estoque row; the client never
// supplies it.
export const insertPedido = async (input: NovoPedidoInput, createdBy: string): Promise<string> => {
  const pedidoId = unwrap(
    await supabase.rpc('fn_create_pedido', {
      p_tipo: input.tipo,
      p_cliente_id: input.clienteId,
      p_numero_pedido: input.numeroPedido ?? null,
      p_observacoes: input.observacoes ?? null,
      p_created_by: createdBy,
      p_itens: input.itens.map((item) => ({
        produto_id: item.produtoId,
        quantidade: item.quantidade,
        unidade_medida: item.unidadeMedida,
        margem_percentual: item.margemPercentual,
      })),
    }),
  ) as string;

  return pedidoId;
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

export const findPedidoById = async (id: string): Promise<Pedido | null> => {
  const { data, error } = await supabase.from('pedidos').select(PEDIDO_SELECT).eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as unknown as PedidoRow;
  const nomeById = await resolveNomeById(row.created_by ? [row.created_by] : []);
  return toPedido(row, nomeById);
};

export const listPedidos = async (): Promise<Pedido[]> => {
  const rows = unwrap(
    await supabase.from('pedidos').select(PEDIDO_SELECT).order('created_at', { ascending: false }),
  ) as unknown as PedidoRow[];

  const ids = rows.map((row) => row.created_by).filter((id): id is string => Boolean(id));
  const nomeById = await resolveNomeById(ids);

  return rows.map((row) => toPedido(row, nomeById));
};
