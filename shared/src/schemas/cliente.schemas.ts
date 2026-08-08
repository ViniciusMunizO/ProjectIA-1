import { z } from 'zod';
import { isValidCnpj, normalizeCnpj } from '../validators/cnpj.js';
import { isValidCpf, normalizeCpf } from '../validators/cpf.js';
import { isValidPhoneBR, normalizePhoneBR } from '../validators/phone-br.js';
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

export const clienteSchema = z
  .object({
    tipoDocumento: z.enum(['CPF', 'CNPJ'], { error: 'Selecione CPF ou CNPJ' }),
    documento: z.string().trim().min(1, { error: 'Documento obrigatório' }),
    nome: z
      .string()
      .trim()
      .min(2, { error: 'Nome deve ter ao menos 2 caracteres' })
      .max(160, { error: 'Nome muito longo' })
      .transform(stripAccents),
    nomeFantasia: optionalFreeText(160),
    email: z.email({ error: 'E-mail inválido' }).trim().toLowerCase().optional().or(z.literal('')),
    telefone: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine((value) => !value || isValidPhoneBR(value), { error: 'Telefone inválido' })
      .transform((value) => (value ? normalizePhoneBR(value) : undefined)),
    cep: optionalText(9),
    logradouro: optionalFreeText(160),
    numero: optionalText(20),
    complemento: optionalFreeText(80),
    bairro: optionalFreeText(80),
    cidade: optionalFreeText(80),
    uf: optionalText(2),
  })
  .transform((data) => ({
    ...data,
    email: data.email ? data.email : undefined,
  }))
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === 'CPF' && !isValidCpf(data.documento)) {
      ctx.addIssue({ code: 'custom', message: 'CPF inválido', path: ['documento'] });
    }
    if (data.tipoDocumento === 'CNPJ' && !isValidCnpj(data.documento)) {
      ctx.addIssue({ code: 'custom', message: 'CNPJ inválido', path: ['documento'] });
    }
  })
  .transform((data) => ({
    ...data,
    documento: data.tipoDocumento === 'CPF' ? normalizeCpf(data.documento) : normalizeCnpj(data.documento),
  }));

export type ClienteInput = z.infer<typeof clienteSchema>;
