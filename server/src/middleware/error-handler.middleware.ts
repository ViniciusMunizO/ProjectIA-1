import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { SupabaseQueryError } from '../db/supabase.js';
import { AppError } from '../lib/http-error.js';

// P0001 is Postgres's default SQLSTATE for a plain `raise exception 'msg'`
// inside a plpgsql function (fn_create_entrada_estoque, fn_create_pedido,
// …) with no explicit error code — that's exactly how this codebase raises
// business-rule violations (insufficient stock, missing custo de entrada,
// non-auditado produto) from inside an RPC transaction. Anything else
// (constraint violations, connection errors, etc.) carries a different
// SQLSTATE and still falls through to the generic 500 below.
const RAISE_EXCEPTION_SQLSTATE = 'P0001';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      fieldErrors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
    });
    return;
  }

  if (err instanceof SupabaseQueryError && err.code === RAISE_EXCEPTION_SQLSTATE) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
};
