import type { CadastroInput } from '../../../shared/src/schemas/cadastro.schemas';
import type { CadastroRecord } from '../../../shared/src/types/cadastro.types';
import { apiGet, apiPost } from './api-client';

export const createCadastro = (input: CadastroInput): Promise<{ cadastro: CadastroRecord }> =>
  apiPost('/cadastros', input);

export const listCadastros = (): Promise<{ cadastros: CadastroRecord[] }> =>
  apiGet('/cadastros');
