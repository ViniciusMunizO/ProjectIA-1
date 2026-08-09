import { Router } from 'express';
import { pedidoSchema } from '../../../../shared/src/schemas/pedido.schemas.js';
import { USER_ROLES } from '../../../../shared/src/types/auth.types.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createPedido, listAllPedidos } from './pedidos.service.js';

export const pedidosRouter = Router();

// Any staff member with an assigned role may register a pedido/orçamento;
// only a pending (role === null) account is excluded.
pedidosRouter.use(requireAuth, requireRole(USER_ROLES));

pedidosRouter.post('/', requireSameOrigin, async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const input = pedidoSchema.parse(req.body);
  const pedido = await createPedido(input, user.id);
  res.status(201).json({ pedido });
});

pedidosRouter.get('/', async (_req, res) => {
  const pedidos = await listAllPedidos();
  res.status(200).json({ pedidos });
});
