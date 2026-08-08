import { Router } from 'express';
import { updateUserSchema } from '../../../../shared/src/schemas/admin.schemas.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { forceRotateSignupKey, getOrRotateSignupKey } from './signup-key.service.js';
import { listUsersFor, removeUser, updateUser } from './users.service.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get('/signup-key', requireRole(['ADMIN']), async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const key = await getOrRotateSignupKey(user.id);
  res.status(200).json(key);
});

adminRouter.post('/signup-key/rotate', requireSameOrigin, requireRole(['ADMIN']), async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const key = await forceRotateSignupKey(user.id);
  res.status(200).json(key);
});

adminRouter.get('/users', requireRole(['ADMIN', 'GERENTE']), async (req, res) => {
  const { user } = req;
  if (!user?.role) {
    throw unauthorized();
  }

  const users = await listUsersFor(user.role);
  res.status(200).json({ users });
});

adminRouter.patch('/users/:id', requireSameOrigin, requireRole(['ADMIN', 'GERENTE']), async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  const input = updateUserSchema.parse(req.body);
  await updateUser(user, id, input);
  res.status(200).json({ ok: true });
});

adminRouter.delete('/users/:id', requireSameOrigin, requireRole(['ADMIN', 'GERENTE']), async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  await removeUser(user, id);
  res.status(200).json({ ok: true });
});
