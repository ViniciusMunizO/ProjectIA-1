import { Router } from 'express';
import { notaEntradaSchema } from '../../../../shared/src/schemas/entrada-estoque.schemas.js';
import { USER_ROLES, WRITE_ROLES } from '../../../../shared/src/types/auth.types.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createEntradaEstoque, listAllEntradasEstoque } from './entradas.service.js';

export const entradasEstoqueRouter = Router();

// Any staff member with an assigned role may register a stock entry; only
// a pending (role === null) account is excluded.
entradasEstoqueRouter.use(requireAuth, requireRole(USER_ROLES));

entradasEstoqueRouter.post('/', requireSameOrigin, requireRole(WRITE_ROLES), async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const input = notaEntradaSchema.parse(req.body);
  const nota = await createEntradaEstoque(input, user.id);
  res.status(201).json({ nota });
});

entradasEstoqueRouter.get('/', async (_req, res) => {
  const notas = await listAllEntradasEstoque();
  res.status(200).json({ notas });
});
