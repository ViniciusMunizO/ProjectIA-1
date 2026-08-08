import { z } from 'zod';
import { isValidCnpj, normalizeCnpj } from '../validators/cnpj.js';
import { stripAccents } from '../validators/text-normalize.js';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: 'Muito longo' })
    .optional()
    .transform((value) => (value ? value : undefined));

// Same as optionalText, but for prose fields (a name, a street) rather than
// a code (CEP, UF): accents are stripped so free text stays consistent
// regardless of how it was typed or pasted in.
const optionalFreeText = (max: number) =>
  optionalText(max).transform((value) => (value ? stripAccents(value) : value));

export const fornecedorSchema = z
  .object({
    cnpj: z.string().trim().min(1, { error: 'CNPJ obrigatório' }),
    razaoSocial: z
      .string()
      .trim()
      .min(2, { error: 'Razão social deve ter ao menos 2 caracteres' })
      .max(160, { error: 'Razão social muito longa' })
      .transform(stripAccents),
    nomeFantasia: optionalFreeText(160),
    cep: optionalText(9),
    logradouro: optionalFreeText(160),
    numero: optionalText(20),
    complemento: optionalFreeText(80),
    bairro: optionalFreeText(80),
    cidade: optionalFreeText(80),
    uf: optionalText(2),
  })
  .superRefine((data, ctx) => {
    if (!isValidCnpj(data.cnpj)) {
      ctx.addIssue({ code: 'custom', message: 'CNPJ inválido', path: ['cnpj'] });
    }
  })
  .transform((data) => ({ ...data, cnpj: normalizeCnpj(data.cnpj) }));

export type FornecedorInput = z.infer<typeof fornecedorSchema>;
