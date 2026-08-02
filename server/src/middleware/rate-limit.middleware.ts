import { rateLimit } from 'express-rate-limit';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const authRateLimitOptions = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: 20,
  standardHeaders: 'draft-8' as const,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
};

export const signupRateLimit = rateLimit(authRateLimitOptions);
export const loginRateLimit = rateLimit(authRateLimitOptions);
