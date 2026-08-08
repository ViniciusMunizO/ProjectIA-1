import { stripAccents } from '../../../../shared/src/validators/text-normalize';
import type { Cliente, TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types';

export type DocumentoAnexadoFilter = 'TODOS' | 'SIM' | 'NAO';

export type ClienteFilters = {
  readonly busca: string;
  readonly tipoDocumento: TipoDocumentoCliente | 'TODOS';
  readonly documentoAnexado: DocumentoAnexadoFilter;
};

export const EMPTY_CLIENTE_FILTERS: ClienteFilters = {
  busca: '',
  tipoDocumento: 'TODOS',
  documentoAnexado: 'TODOS',
};

const matchesBusca = (cliente: Cliente, busca: string): boolean => {
  if (!busca) {
    return true;
  }

  // Stored free text already has accents stripped (see cliente.schemas.ts),
  // so the query is normalized the same way to keep matching consistent
  // regardless of how the person typed it.
  const needle = stripAccents(busca.trim().toLowerCase());
  const haystacks = [
    cliente.nome,
    cliente.nomeFantasia ?? '',
    cliente.documento,
    cliente.email ?? '',
    cliente.telefone ?? '',
    cliente.cidade ?? '',
    String(cliente.codigo),
  ];

  return haystacks.some((field) => stripAccents(field.toLowerCase()).includes(needle));
};

export const filterClientes = (clientes: readonly Cliente[], filters: ClienteFilters): Cliente[] =>
  clientes.filter((cliente) => {
    if (!matchesBusca(cliente, filters.busca)) {
      return false;
    }
    if (filters.tipoDocumento !== 'TODOS' && cliente.tipoDocumento !== filters.tipoDocumento) {
      return false;
    }
    if (filters.documentoAnexado === 'SIM' && !cliente.temDocumentoAnexado) {
      return false;
    }
    if (filters.documentoAnexado === 'NAO' && cliente.temDocumentoAnexado) {
      return false;
    }
    return true;
  });
