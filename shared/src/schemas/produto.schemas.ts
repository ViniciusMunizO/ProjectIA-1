import { z } from 'zod';
import { CATEGORIAS_PRODUTO } from '../types/produto.types.js';
import { stripAccents } from '../validators/text-normalize.js';

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: 'Campo obrigatório' })
    .max(max, { error: 'Muito longo' });

// Same as requiredText, but for prose fields (product name, description)
// rather than a technical code (EAN, barcode): accents are stripped so free
// text stays consistent regardless of how it was typed or pasted in.
const requiredFreeText = (max: number) => requiredText(max).transform(stripAccents);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: 'Muito longo' })
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalFreeText = (max: number) =>
  optionalText(max).transform((value) => (value ? stripAccents(value) : value));

export const produtoSchema = z
  .object({
    nome: requiredFreeText(160),
    nomeComercial: requiredFreeText(160),
    marca: requiredFreeText(80),
    descricao: optionalFreeText(2000),
    categoria: z.enum(CATEGORIAS_PRODUTO, { error: 'Selecione uma categoria' }),
    ean: optionalText(20),
    registroAnvisa: optionalText(40),
    codigoBarras: requiredText(48),
    quantidadeCaixa: z.coerce.number().int().positive({ error: 'Deve ser maior que zero' }),
    controlado: z.boolean().optional().default(false),
  })
  // "Controlado" only applies to Medicamento: the app never trusts a client
  // value outside that rule, so it is normalized here rather than merely
  // validated, closing off the field for every other category up front.
  .transform((data) => ({
    ...data,
    controlado: data.categoria === 'MEDICAMENTO' ? data.controlado : false,
  }));

export type ProdutoInput = z.infer<typeof produtoSchema>;

export const auditadoSchema = z.object({
  auditado: z.boolean(),
});

export type AuditadoInput = z.infer<typeof auditadoSchema>;
