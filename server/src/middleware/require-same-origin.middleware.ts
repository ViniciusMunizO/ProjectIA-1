import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/http-error.js';

// The actual CSRF defense, independent of the session cookie's SameSite
// setting (which varies by environment — see session-cookie.ts): a plain
// cross-site form submission cannot attach a custom header, and a
// cross-origin fetch/XHR can only attach one if our CORS_ORIGIN allowlist
// approved its origin, so requiring this header blocks forged requests
// regardless of SameSite.
export const requireSameOrigin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.header('X-Requested-With') !== 'app') {
    next(new AppError(403, 'Requisição rejeitada'));
    return;
  }
  next();
};
