export { isValidCpf, formatCpf, normalizeCpf } from './validators/cpf.js';
export { isValidCnpj, formatCnpj, normalizeCnpj } from './validators/cnpj.js';
export { isValidPhoneBR, formatPhoneBR, normalizePhoneBR } from './validators/phone-br.js';
export { stripAccents } from './validators/text-normalize.js';
export {
  checkPasswordStrength,
  type PasswordRuleId,
  type PasswordRuleResult,
  type PasswordStrength,
  type PasswordCheckResult,
  type PasswordCheckContext,
} from './validators/password-policy.js';

export { signupSchema, loginSchema, type SignupInput, type LoginInput } from './schemas/auth.schemas.js';
export { clienteSchema, type ClienteInput } from './schemas/cliente.schemas.js';
export { produtoSchema, auditadoSchema, type ProdutoInput, type AuditadoInput } from './schemas/produto.schemas.js';
export { fornecedorSchema, type FornecedorInput } from './schemas/fornecedor.schemas.js';
export { cnpjLookupParamSchema } from './schemas/cnpj-lookup.schemas.js';
export { updateUserSchema, type UpdateUserInput } from './schemas/admin.schemas.js';

export type { User, UserRole, AdminUserView } from './types/auth.types.js';
export type { Cliente, TipoDocumentoCliente } from './types/cliente.types.js';
export { CATEGORIAS_PRODUTO, type Produto, type CategoriaProduto } from './types/produto.types.js';
export type { Fornecedor } from './types/fornecedor.types.js';
export type { CnpjLookupResult } from './types/cnpj-lookup.types.js';
export type { ApiError, ApiResult } from './types/api.types.js';
