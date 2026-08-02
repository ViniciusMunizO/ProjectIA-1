import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { cadastroRouter } from './modules/cadastro/cadastro.routes.js';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    // Defense in depth: the API itself only ever returns JSON, but these
    // headers cost nothing and cover any HTML Express might ever generate
    // (e.g. a framework-level error page). The frontend's own HTML response
    // carries the equivalent headers where it is actually served.
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self'");
    next();
  });

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(sessionMiddleware);

  app.use('/api/auth', authRouter);
  app.use('/api/cadastros', cadastroRouter);

  app.use(errorHandler);

  return app;
};
