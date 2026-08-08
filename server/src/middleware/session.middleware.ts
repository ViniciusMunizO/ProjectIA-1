import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE_NAME } from '../lib/session-cookie.js';
import { getUserBySession } from '../modules/auth/auth.service.js';

export const sessionMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  try {
    req.user = (await getUserBySession(sessionId)) ?? undefined;
    next();
  } catch (err) {
    next(err);
  }
};
