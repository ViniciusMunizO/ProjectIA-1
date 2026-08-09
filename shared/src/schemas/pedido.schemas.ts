import { z } from 'zod';
import { UNIDADES_MEDIDA } from '../types/entrada-estoque.types.js';
import { TIPOS_PEDIDO } from '../types/pedido.types.js';

export const pedidoItemSchema = z.object({
  produtoId: z.string().trim().min(1, { error: 'Produto obrigatório' }),
  quantidade: z.coerce.number().int().positive({ error: 'Deve ser maior que zero' }),
  unidadeMedida: z.enum(UNIDADES_MEDIDA, { error: 'Selecione CX ou UN' }),
  margemPercentual: z.coerce.number().nonnegative({ error: 'Margem inválida' }),
});

export type PedidoItemInput = z.infer<typeof pedidoItemSchema>;

export const pedidoSchema = z.object({
  tipo: z.enum(TIPOS_PEDIDO, { error: 'Selecione Orçamento ou Pedido' }),
  clienteId: z.string().trim().min(1, { error: 'Selecione um cliente' }),
  numeroPedido: z
    .string()
    .trim()
    .max(60, { error: 'Muito longo' })
    .optional()
    .transform((value) => (value ? value : undefined)),
  observacoes: z
    .string()
    .trim()
    .max(2000, { error: 'Muito longo' })
    .optional()
    .transform((value) => (value ? value : undefined)),
  itens: z.array(pedidoItemSchema).min(1, { error: 'Adicione ao menos um item' }),
});

export type PedidoInput = z.infer<typeof pedidoSchema>;
