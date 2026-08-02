export { isValidCpf, formatCpf, normalizeCpf } from './validators/cpf.js';
export { isValidPhoneBR, formatPhoneBR, normalizePhoneBR } from './validators/phone-br.js';
export {
  checkPasswordStrength,
  type PasswordRuleId,
  type PasswordRuleResult,
  type PasswordStrength,
  type PasswordCheckResult,
  type PasswordCheckContext,
} from './validators/password-policy.js';

export { signupSchema, loginSchema, type SignupInput, type LoginInput } from './schemas/auth.schemas.js';
export { cadastroSchema, type CadastroInput } from './schemas/cadastro.schemas.js';

export type { User } from './types/auth.types.js';
export type { CadastroRecord } from './types/cadastro.types.js';
export type { ApiError, ApiResult } from './types/api.types.js';
