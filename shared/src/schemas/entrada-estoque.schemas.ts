import { z } from 'zod';
import { UNIDADES_MEDIDA } from '../types/entrada-estoque.types.js';

export const notaEntradaItemSchema = z.object({
  produtoId: z.string().trim().min(1, { error: 'Produto obrigatório' }),
  lote: z.string().trim().min(1, { error: 'Lote obrigatório' }).max(60, { error: 'Muito longo' }),
  dataFabricacao: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  validade: z.iso.date({ error: 'Validade obrigatória' }),
  unidadeMedida: z.enum(UNIDADES_MEDIDA, { error: 'Selecione CX ou UN' }),
  quantidade: z.coerce.number().int().positive({ error: 'Deve ser maior que zero' }),
  custoUnitario: z.coerce.number().nonnegative({ error: 'Custo unitário inválido' }),
});

export type NotaEntradaItemInput = z.infer<typeof notaEntradaItemSchema>;

// Blank frete/desconto simply mean "zero", not "unset" — a discount field
// left empty and one explicitly set to 0 carry the same information here,
// so there's no need to distinguish them with null.
export const notaEntradaSchema = z.object({
  fornecedorId: z.string().trim().min(1, { error: 'Selecione um fornecedor' }),
  valorFrete: z.coerce.number().nonnegative({ error: 'Valor inválido' }).optional().default(0),
  desconto: z.coerce.number().nonnegative({ error: 'Valor inválido' }).optional().default(0),
  itens: z.array(notaEntradaItemSchema).min(1, { error: 'Adicione ao menos um item' }),
});

export type NotaEntradaInput = z.infer<typeof notaEntradaSchema>;
