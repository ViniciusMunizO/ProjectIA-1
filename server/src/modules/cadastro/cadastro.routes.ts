import { Router } from 'express';
import { cadastroSchema } from '../../../../shared/src/schemas/cadastro.schemas.js';
import { unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createCadastro, listCadastros } from './cadastro.service.js';

export const cadastroRouter = Router();

cadastroRouter.use(requireAuth);

cadastroRouter.post('/', requireSameOrigin, (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const { nome, cpf, email, telefone } = cadastroSchema.parse(req.body);
  const record = createCadastro(user.id, nome, cpf, email, telefone);
  res.status(201).json({ cadastro: record });
});

cadastroRouter.get('/', (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const records = listCadastros(user.id);
  res.status(200).json({ cadastros: records });
});
