import { Router } from 'express';
import multer from 'multer';
import { clienteSchema } from '../../../../shared/src/schemas/cliente.schemas.js';
import { cnpjLookupParamSchema } from '../../../../shared/src/schemas/cnpj-lookup.schemas.js';
import { USER_ROLES, WRITE_ROLES } from '../../../../shared/src/types/auth.types.js';
import { notFound, unauthorized } from '../../lib/http-error.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireRole } from '../../middleware/require-role.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createCliente, listAllClientes, updateCliente } from './clientes.service.js';
import { findClienteDocumentoPath } from './clientes.repository.js';
import { getClienteDocumentoSignedUrl } from './documento-upload.service.js';
import { lookupCnpj } from '../../lib/cnpj-lookup.service.js';

// Held in memory only long enough to validate the signature and forward the
// bytes to Supabase Storage: the file never touches local disk, so none of
// the local path-traversal surface applies to it.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Any staff member with an assigned role may work with clientes; only a
// pending (role === null) account is excluded.
const ANY_ASSIGNED_ROLE = USER_ROLES;

export const clientesRouter = Router();

clientesRouter.use(requireAuth, requireRole(ANY_ASSIGNED_ROLE));

clientesRouter.post('/', requireSameOrigin, requireRole(WRITE_ROLES), upload.single('arquivo'), async (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const input = clienteSchema.parse(req.body);
  const file = req.file ? { buffer: req.file.buffer, size: req.file.size } : null;

  const result = await createCliente(input, user.id, file);
  res.status(201).json(result);
});

clientesRouter.patch('/:id', requireSameOrigin, requireRole(WRITE_ROLES), async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user || typeof id !== 'string') {
    throw unauthorized();
  }

  const input = clienteSchema.parse(req.body);
  const cliente = await updateCliente(id, input, user.id);
  res.status(200).json({ cliente });
});

clientesRouter.get('/', async (_req, res) => {
  const clientes = await listAllClientes();
  res.status(200).json({ clientes });
});

clientesRouter.get('/cnpj/:cnpj', async (req, res) => {
  const cnpj = cnpjLookupParamSchema.parse(req.params.cnpj);
  const dados = await lookupCnpj(cnpj);
  res.status(200).json(dados);
});

clientesRouter.get('/:id/documento', async (req, res) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw notFound();
  }

  const path = await findClienteDocumentoPath(id);
  if (path === undefined) {
    throw notFound('Cliente não encontrado');
  }
  if (path === null) {
    throw notFound('Este cliente não possui documento anexado');
  }

  const url = await getClienteDocumentoSignedUrl(path);
  res.status(200).json({ url });
});
