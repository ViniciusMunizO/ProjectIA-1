import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE_NAME } from '../lib/session-cookie.js';
import { getUserBySession } from '../modules/auth/auth.service.js';

export const sessionMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  req.user = getUserBySession(sessionId) ?? undefined;
  next();
};
