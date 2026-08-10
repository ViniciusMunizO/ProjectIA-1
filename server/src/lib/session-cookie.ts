import type { Response } from 'express';
import { isProduction } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'sid';

// Local dev serves frontend and API from what the browser treats as the
// same site (Vite proxies /api), so Lax is enough and works over plain
// HTTP. The deployed frontend (GitHub Pages) and backend (Render) sit on
// different origins, which only ever works with SameSite=None — and
// SameSite=None is rejected by browsers unless Secure is also set, which
// requires HTTPS, which is exactly what both of those hosts give us in
// production. This doesn't weaken CSRF protection: that's enforced by
// requireSameOrigin's custom-header check plus the CORS_ORIGIN allowlist,
// not by SameSite (see require-same-origin.middleware.ts).
const sameSite = isProduction ? 'none' : 'lax';

export const setSessionCookie = (res: Response, sessionId: string, expiresAt: Date): void => {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: '/',
    expires: expiresAt,
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: '/',
  });
};
