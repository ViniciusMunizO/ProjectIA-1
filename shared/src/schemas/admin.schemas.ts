import { z } from 'zod';
import { USER_ROLES } from '../types/auth.types.js';

const nomeSchema = z
  .string()
  .trim()
  .min(2, { error: 'Nome deve ter ao menos 2 caracteres' })
  .max(120, { error: 'Nome muito longo' });

const emailSchema = z.email({ error: 'E-mail inválido' }).trim().toLowerCase();

export const updateUserSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  role: z.enum(USER_ROLES),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
