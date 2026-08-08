import type { CategoriaProduto } from '../../../shared/src/types/produto.types';

const CATEGORIA_LABELS: Record<CategoriaProduto, string> = {
  MEDICAMENTO: 'Medicamento',
  MATERIAL_HOSPITALAR: 'Material Hospitalar',
  OUTROS: 'Outros',
};

export const categoriaLabel = (categoria: CategoriaProduto): string => CATEGORIA_LABELS[categoria];

// Fixed, code-defined host and path. ANVISA's consulta app is a client-side
// hash router, so its query string lives after the "#" rather than before
// it (the URLSearchParams API only ever targets the part before "#", which
// would land the param on the wrong side); the registration number is the
// only dynamic part, and encodeURIComponent keeps it confined to a single
// query value, unable to inject another param or change the destination.
export const anvisaConsultaUrl = (registroAnvisa: string): string =>
  `https://consultas.anvisa.gov.br/#/medicamentos/q/?numeroRegistro=${encodeURIComponent(registroAnvisa)}`;
