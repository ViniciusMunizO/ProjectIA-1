import { existsSync } from 'node:fs';
import { z } from 'zod';

const envFilePath = new URL('../../.env', import.meta.url);
if (existsSync(envFilePath)) {
  process.loadEnvFile(envFilePath);
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.url({ error: 'SUPABASE_URL must be a valid URL' }),
  // Server-only: bypasses row-level security. Never expose to the frontend.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { error: 'SUPABASE_SERVICE_ROLE_KEY is required' }),
  COOKIE_SECRET: z.string().min(16, {
    error: 'COOKIE_SECRET must be at least 16 characters',
  }),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  SESSION_IDLE_TIMEOUT_HOURS: z.coerce.number().int().positive().default(2),
  // Comma-separated list of allowed origins (e.g. the GitHub Pages URL and
  // a custom domain at once) — kept as an explicit allowlist, never a
  // wildcard or a reflected origin, since it's what backs the CSRF defense
  // in require-same-origin.middleware.ts alongside the custom header check.
  CORS_ORIGIN: z
    .string()
    .min(1)
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
});

export const env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === 'production';
