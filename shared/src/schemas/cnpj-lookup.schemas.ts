import { z } from 'zod';
import { isValidCnpj, normalizeCnpj } from '../validators/cnpj.js';

// Shared between every module that offers a "buscar CNPJ" lookup
// (clientes, fornecedores, ...).
export const cnpjLookupParamSchema = z
  .string()
  .trim()
  .transform(normalizeCnpj)
  .refine(isValidCnpj, { error: 'CNPJ inválido' });
