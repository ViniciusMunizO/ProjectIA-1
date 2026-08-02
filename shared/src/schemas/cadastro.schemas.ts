import { z } from 'zod';
import { isValidCpf, normalizeCpf } from '../validators/cpf.js';
import { isValidPhoneBR, normalizePhoneBR } from '../validators/phone-br.js';

export const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { error: 'Nome deve ter ao menos 2 caracteres' })
    .max(120, { error: 'Nome muito longo' }),
  cpf: z
    .string()
    .transform(normalizeCpf)
    .refine(isValidCpf, { error: 'CPF inválido' }),
  email: z.email({ error: 'E-mail inválido' }).trim().toLowerCase(),
  telefone: z
    .string()
    .transform(normalizePhoneBR)
    .refine(isValidPhoneBR, { error: 'Telefone inválido' }),
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
