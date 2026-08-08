import { Router } from 'express';
import { fornecedorSchema } from '../../../../shared/src/schemas/fornecedor.schemas.js';
import { cnpjLookupParamSchema } from '../../../../shared/src/schemas/cnpj-lookup.schemas.js';
import { USER_ROLES } from '../../../../shared/src/types/auth.types.js';
import { lookupCnpj } from '../../lib/cnpj-lookup.service.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createFornecedor, listAllFornecedores, updateFornecedor } from './fornecedores.service.js';

export const fornecedoresRouter = Router();

// Any staff member with an assigned role may work with fornecedores; only a
// pending (role === null) account is excluded.
fornecedoresRouter.use(requireAuth, requireRole(USER_ROLES));

fornecedoresRouter.post('/', requireSameOrigin, async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const input = fornecedorSchema.parse(req.body);
  const fornecedor = await createFornecedor(input, user.id);
  res.status(201).json({ fornecedor });
});

fornecedoresRouter.get('/', async (_req, res) => {
  const fornecedores = await listAllFornecedores();
  res.status(200).json({ fornecedores });
});

fornecedoresRouter.get('/cnpj/:cnpj', async (req, res) => {
  const cnpj = cnpjLookupParamSchema.parse(req.params.cnpj);
  const dados = await lookupCnpj(cnpj);
  res.status(200).json(dados);
});

fornecedoresRouter.patch('/:id', requireSameOrigin, async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  const input = fornecedorSchema.parse(req.body);
  const fornecedor = await updateFornecedor(id, input, user.id);
  res.status(200).json({ fornecedor });
});
