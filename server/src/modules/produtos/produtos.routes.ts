import { Router } from 'express';
import { auditadoSchema, produtoSchema } from '../../../../shared/src/schemas/produto.schemas.js';
import { USER_ROLES, WRITE_ROLES } from '../../../../shared/src/types/auth.types.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createProduto, listAllProdutos, setAuditado, updateProduto } from './produtos.service.js';

export const produtosRouter = Router();

// Any staff member with an assigned role may work with produtos; the
// auditado toggle narrows further to ADMIN/FARMACEUTICO inside the route.
produtosRouter.use(requireAuth, requireRole(USER_ROLES));

produtosRouter.post('/', requireSameOrigin, requireRole(WRITE_ROLES), async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const input = produtoSchema.parse(req.body);
  const produto = await createProduto(input, user.id);
  res.status(201).json({ produto });
});

produtosRouter.get('/', async (_req, res) => {
  const produtos = await listAllProdutos();
  res.status(200).json({ produtos });
});

produtosRouter.patch('/:id', requireSameOrigin, requireRole(WRITE_ROLES), async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  const input = produtoSchema.parse(req.body);
  const produto = await updateProduto(id, input, user.id);
  res.status(200).json({ produto });
});

produtosRouter.patch('/:id/auditado', requireSameOrigin, requireRole(WRITE_ROLES), async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  const { auditado } = auditadoSchema.parse(req.body);
  await setAuditado(user, id, auditado);
  res.status(200).json({ ok: true });
});
