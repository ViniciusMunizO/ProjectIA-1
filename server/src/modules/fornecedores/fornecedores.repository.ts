import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types.js';
import { supabase, SupabaseQueryError, unwrap } from '../../db/supabase.js';

type FornecedorRow = {
  id: string;
  codigo: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
};

const FORNECEDOR_COLUMNS =
  'id, codigo, cnpj, razao_social, nome_fantasia, cep, logradouro, numero, complemento, bairro, cidade, uf, created_by, created_at, updated_by, updated_at';

export type NovoFornecedorInput = {
  readonly cnpj: string;
  readonly razaoSocial: string;
  readonly nomeFantasia?: string;
  readonly cep?: string;
  readonly logradouro?: string;
  readonly numero?: string;
  readonly complemento?: string;
  readonly bairro?: string;
  readonly cidade?: string;
  readonly uf?: string;
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

const toFornecedor = (row: FornecedorRow, nomeById: ReadonlyMap<string, string>): Fornecedor => ({
  id: row.id,
  codigo: row.codigo,
  cnpj: row.cnpj,
  razaoSocial: row.razao_social,
  nomeFantasia: row.nome_fantasia,
  cep: row.cep,
  logradouro: row.logradouro,
  numero: row.numero,
  complemento: row.complemento,
  bairro: row.bairro,
  cidade: row.cidade,
  uf: row.uf,
  createdByNome: row.created_by ? (nomeById.get(row.created_by) ?? null) : null,
  createdAt: row.created_at,
  updatedByNome: row.updated_by ? (nomeById.get(row.updated_by) ?? null) : null,
  updatedAt: row.updated_at,
});

const toInsertRow = (input: NovoFornecedorInput) => ({
  cnpj: input.cnpj,
  razao_social: input.razaoSocial,
  nome_fantasia: input.nomeFantasia ?? null,
  cep: input.cep ?? null,
  logradouro: input.logradouro ?? null,
  numero: input.numero ?? null,
  complemento: input.complemento ?? null,
  bairro: input.bairro ?? null,
  cidade: input.cidade ?? null,
  uf: input.uf ?? null,
});

export const insertFornecedor = async (input: NovoFornecedorInput, createdBy: string): Promise<Fornecedor> => {
  const row = unwrap(
    await supabase
      .from('fornecedores')
      .insert({ ...toInsertRow(input), created_by: createdBy, updated_by: createdBy })
      .select(FORNECEDOR_COLUMNS)
      .single(),
  ) as FornecedorRow;

  const nomeById = await resolveNomeById([createdBy]);
  return toFornecedor(row, nomeById);
};

export const listFornecedores = async (): Promise<Fornecedor[]> => {
  const rows = unwrap(
    await supabase.from('fornecedores').select(FORNECEDOR_COLUMNS).order('created_at', { ascending: false }),
  ) as FornecedorRow[];

  const ids = rows.flatMap((row) => [row.created_by, row.updated_by].filter((id): id is string => Boolean(id)));
  const nomeById = await resolveNomeById(ids);

  return rows.map((row) => toFornecedor(row, nomeById));
};

export const updateFornecedor = async (
  id: string,
  input: NovoFornecedorInput,
  updatedBy: string,
): Promise<Fornecedor | null> => {
  const { data, error } = await supabase
    .from('fornecedores')
    .update({ ...toInsertRow(input), updated_by: updatedBy, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(FORNECEDOR_COLUMNS)
    .maybeSingle();

  if (error) {
    // Wrapped the same way unwrap() does, so the service's unique-violation
    // check (which matches on SupabaseQueryError, not a raw Postgrest
    // error) actually catches it here too.
    throw new SupabaseQueryError(error.message, error.code);
  }
  if (!data) {
    return null;
  }

  const row = data as FornecedorRow;
  const nomeById = await resolveNomeById(
    [row.created_by, row.updated_by].filter((rowId): rowId is string => Boolean(rowId)),
  );
  return toFornecedor(row, nomeById);
};
