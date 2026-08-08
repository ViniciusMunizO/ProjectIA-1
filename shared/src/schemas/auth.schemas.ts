import { z } from 'zod';
import { checkPasswordStrength } from '../validators/password-policy.js';

const nomeSchema = z
  .string()
  .trim()
  .min(2, { error: 'Nome deve ter ao menos 2 caracteres' })
  .max(120, { error: 'Nome muito longo' });

const emailSchema = z.email({ error: 'E-mail inválido' }).trim().toLowerCase();

const chaveAcessoSchema = z
  .string()
  .trim()
  .length(8, { error: 'Chave de acesso deve ter 8 caracteres' })
  .regex(/^[A-Za-z0-9]{8}$/, { error: 'Chave de acesso inválida' });

export const signupSchema = z
  .object({
    nome: nomeSchema,
    email: emailSchema,
    senha: z.string(),
    chaveAcesso: chaveAcessoSchema,
  })
  .superRefine((data, ctx) => {
    const result = checkPasswordStrength(data.senha, { nome: data.nome, email: data.email });

    if (!result.valid) {
      ctx.addIssue({
        code: 'custom',
        message: 'A senha não atende aos requisitos de segurança',
        path: ['senha'],
      });
    }
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, { error: 'Senha obrigatória' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
