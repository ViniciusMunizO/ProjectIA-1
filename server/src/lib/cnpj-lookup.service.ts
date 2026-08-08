import type { CnpjLookupResult } from '../../../shared/src/types/cnpj-lookup.types.js';
import { AppError } from './http-error.js';

// Fixed, code-defined host: the caller only ever supplies a pre-validated
// 14-digit CNPJ (see cnpjLookupParamSchema), which is appended to a trusted
// base URL, never a user-supplied URL or host. This is not SSRF-shaped: the
// destination is chosen by the server, not the request. Shared by every
// module that registers an entity by CNPJ (clientes, fornecedores, ...).
const BRASIL_API_BASE = 'https://brasilapi.com.br/api/cnpj/v1';
const FETCH_TIMEOUT_MS = 8000;

type BrasilApiCnpjResponse = {
  readonly razao_social?: string;
  readonly nome_fantasia?: string | null;
  readonly cep?: string | null;
  readonly logradouro?: string | null;
  readonly numero?: string | null;
  readonly complemento?: string | null;
  readonly bairro?: string | null;
  readonly municipio?: string | null;
  readonly uf?: string | null;
};

export const lookupCnpj = async (cnpj: string): Promise<CnpjLookupResult> => {
  let response: Response;
  try {
    response = await fetch(`${BRASIL_API_BASE}/${cnpj}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // BrasilAPI's edge rejects requests with no User-Agent (Node's fetch
      // sends none by default) with a 403 that isn't even JSON.
      headers: { 'User-Agent': 'VMO-Sistema/1.0', Accept: 'application/json' },
    });
  } catch {
    throw new AppError(502, 'Não foi possível consultar o CNPJ agora. Preencha os dados manualmente.');
  }

  if (response.status === 404) {
    throw new AppError(404, 'CNPJ não encontrado. Confira o número ou preencha os dados manualmente.');
  }

  if (!response.ok) {
    throw new AppError(502, 'Não foi possível consultar o CNPJ agora. Preencha os dados manualmente.');
  }

  const data = (await response.json()) as BrasilApiCnpjResponse;

  return {
    razaoSocial: data.razao_social ?? '',
    nomeFantasia: data.nome_fantasia ?? null,
    cep: data.cep ?? null,
    logradouro: data.logradouro ?? null,
    numero: data.numero ?? null,
    complemento: data.complemento ?? null,
    bairro: data.bairro ?? null,
    cidade: data.municipio ?? null,
    uf: data.uf ?? null,
  };
};
