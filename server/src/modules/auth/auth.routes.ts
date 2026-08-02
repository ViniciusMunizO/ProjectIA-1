import { Router } from 'express';
import { loginSchema, signupSchema } from '../../../../shared/src/schemas/auth.schemas.js';
import { unauthorized } from '../../lib/http-error.js';
import { clearSessionCookie, setSessionCookie, SESSION_COOKIE_NAME } from '../../lib/session-cookie.js';
import { loginRateLimit, signupRateLimit } from '../../middleware/rate-limit.middleware.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireSameOrigin } from '../../middleware/require-same-origin.middleware.js';
import { createSessionForUser, listSessions, login, logout, revokeSession, signup } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/signup', signupRateLimit, requireSameOrigin, async (req, res) => {
  const { nome, email, senha } = signupSchema.parse(req.body);
  const user = await signup(nome, email, senha);
  const { sessionId, expiresAt } = createSessionForUser(user.id);

  setSessionCookie(res, sessionId, expiresAt);
  res.status(201).json({ user });
});

authRouter.post('/login', loginRateLimit, requireSameOrigin, async (req, res) => {
  const { email, senha } = loginSchema.parse(req.body);
  const { user, sessionId, expiresAt } = await login(email, senha);

  setSessionCookie(res, sessionId, expiresAt);
  res.status(200).json({ user });
});

authRouter.post('/logout', requireSameOrigin, requireAuth, (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  logout(sessionId);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  res.status(200).json({ user: req.user ?? null });
});

authRouter.get('/sessions', requireAuth, (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const currentSessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const sessions = listSessions(user.id, currentSessionId);

  res.status(200).json({ sessions });
});

authRouter.delete('/sessions/:publicId', requireSameOrigin, requireAuth, (req, res) => {
  const { user } = req;
  if (!user) {
    throw unauthorized();
  }

  const { publicId } = req.params;
  if (typeof publicId !== 'string') {
    res.status(404).json({ ok: false });
    return;
  }

  const revoked = revokeSession(user.id, publicId);
  res.status(revoked ? 200 : 404).json({ ok: revoked });
});
