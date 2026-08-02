import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/http-error.js';

// Defense-in-depth on top of the SameSite=Lax cookie: a plain cross-site
// form submission cannot attach a custom header, so requiring one here
// blocks the CSRF paths SameSite alone does not cover.
export const requireSameOrigin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.header('X-Requested-With') !== 'app') {
    next(new AppError(403, 'Requisição rejeitada'));
    return;
  }
  next();
};
