import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../../../shared/src/types/auth.types.js';
import { forbidden, unauthorized } from '../lib/http-error.js';

// Assumes requireAuth already ran: this only decides authorization, never
// authentication, so it must never be mounted ahead of requireAuth.
export const requireRole = (allowed: readonly UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!req.user.role || !allowed.includes(req.user.role)) {
      next(forbidden('Você não tem permissão para acessar este recurso.'));
      return;
    }

    next();
  };
};
