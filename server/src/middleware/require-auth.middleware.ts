import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../lib/http-error.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(unauthorized());
    return;
  }
  next();
};
