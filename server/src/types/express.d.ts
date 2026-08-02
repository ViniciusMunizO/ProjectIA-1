import type { User } from '../../../shared/src/types/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
