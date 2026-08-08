import type { Cliente, TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types.js';
import { supabase, SupabaseQueryError, unwrap } from '../../db/supabase.js';

type ClienteRow = {
  id: string;
  codigo: number;
  tipo_documento: TipoDocumentoCliente;
  documento: string;
  nome: string;
  nome_fantasia: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  documento_arquivo_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
};

const CLIENTE_COLUMNS =
  'id, codigo, tipo_documento, documento, nome, nome_fantasia, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf, documento_arquivo_path, created_by, created_at, updated_by, updated_at';

export type NovoClienteInput = {
  readonly tipoDocumento: TipoDocumentoCliente;
  readonly documento: string;
  readonly nome: string;
  readonly nomeFantasia?: string;
  readonly email?: string;
  readonly telefone?: string;
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

const toCliente = (row: ClienteRow, nomeById: ReadonlyMap<string, string>): Cliente => ({
  id: row.id,
  codigo: row.codigo,
  tipoDocumento: row.tipo_documento,
  documento: row.documento,
  nome: row.nome,
  nomeFantasia: row.nome_fantasia,
  email: row.email,
  telefone: row.telefone,
  cep: row.cep,
  logradouro: row.logradouro,
  numero: row.numero,
  complemento: row.complemento,
  bairro: row.bairro,
  cidade: row.cidade,
  uf: row.uf,
  temDocumentoAnexado: row.documento_arquivo_path !== null,
  createdByNome: row.created_by ? (nomeById.get(row.created_by) ?? null) : null,
  createdAt: row.created_at,
  updatedByNome: row.updated_by ? (nomeById.get(row.updated_by) ?? null) : null,
  updatedAt: row.updated_at,
});

export const insertCliente = async (input: NovoClienteInput, createdBy: string): Promise<Cliente> => {
  const row = unwrap(
    await supabase
      .from('clientes')
      .insert({
        tipo_documento: input.tipoDocumento,
        documento: input.documento,
        nome: input.nome,
        nome_fantasia: input.nomeFantasia ?? null,
        email: input.email ?? null,
        telefone: input.telefone ?? null,
        cep: input.cep ?? null,
        logradouro: input.logradouro ?? null,
        numero: input.numero ?? null,
        complemento: input.complemento ?? null,
        bairro: input.bairro ?? null,
        cidade: input.cidade ?? null,
        uf: input.uf ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .select(CLIENTE_COLUMNS)
      .single(),
  ) as ClienteRow;

  const nomeById = await resolveNomeById([createdBy]);
  return toCliente(row, nomeById);
};

export const updateCliente = async (
  id: string,
  input: NovoClienteInput,
  updatedBy: string,
): Promise<Cliente | null> => {
  const { data, error } = await supabase
    .from('clientes')
    .update({
      tipo_documento: input.tipoDocumento,
      documento: input.documento,
      nome: input.nome,
      nome_fantasia: input.nomeFantasia ?? null,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      cep: input.cep ?? null,
      logradouro: input.logradouro ?? null,
      numero: input.numero ?? null,
      complemento: input.complemento ?? null,
      bairro: input.bairro ?? null,
      cidade: input.cidade ?? null,
      uf: input.uf ?? null,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(CLIENTE_COLUMNS)
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

  const row = data as ClienteRow;
  const nomeById = await resolveNomeById(
    [row.created_by, row.updated_by].filter((rowId): rowId is string => Boolean(rowId)),
  );
  return toCliente(row, nomeById);
};

export const setClienteDocumentoPath = async (id: string, path: string): Promise<void> => {
  const { error } = await supabase.from('clientes').update({ documento_arquivo_path: path }).eq('id', id);
  if (error) {
    throw error;
  }
};

export const findClienteDocumentoPath = async (id: string): Promise<string | null | undefined> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('documento_arquivo_path')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data ? (data as { documento_arquivo_path: string | null }).documento_arquivo_path : undefined;
};

export const listClientes = async (): Promise<Cliente[]> => {
  const rows = unwrap(
    await supabase.from('clientes').select(CLIENTE_COLUMNS).order('created_at', { ascending: false }),
  ) as ClienteRow[];

  const ids = rows.flatMap((row) => [row.created_by, row.updated_by].filter((id): id is string => Boolean(id)));
  const nomeById = await resolveNomeById(ids);

  return rows.map((row) => toCliente(row, nomeById));
};
