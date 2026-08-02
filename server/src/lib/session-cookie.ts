import type { Response } from 'express';
import { isProduction } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'sid';

export const setSessionCookie = (res: Response, sessionId: string, expiresAt: Date): void => {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
};
