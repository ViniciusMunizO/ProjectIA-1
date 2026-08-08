import { timingSafeEqual } from 'node:crypto';
import { generateAccessKey } from '../../lib/access-key.js';
import { getCurrentSignupKey, upsertSignupKey } from './signup-key.repository.js';

const KEY_TTL_MS = 30 * 60 * 1000;

const isExpired = (expiresAt: string): boolean => new Date(expiresAt).getTime() <= Date.now();

const rotate = async (adminId: string): Promise<{ key: string; expiresAt: string }> => {
  const key = generateAccessKey();
  const expiresAt = new Date(Date.now() + KEY_TTL_MS);
  await upsertSignupKey(key, expiresAt, adminId);

  return { key, expiresAt: expiresAt.toISOString() };
};

// Passive read: only rotates when the current key has actually expired, so
// a page load or the panel's own expiry timer doesn't churn a still-valid
// key.
export const getOrRotateSignupKey = async (
  adminId: string,
): Promise<{ key: string; expiresAt: string }> => {
  const current = await getCurrentSignupKey();

  if (current && !isExpired(current.expires_at)) {
    return { key: current.key_value, expiresAt: current.expires_at };
  }

  return rotate(adminId);
};

// Explicit action behind the "Atualizar" button: always issues a brand new
// key, even if the current one is still valid. Without this, clicking the
// button while the key had time left just handed back the unchanged key,
// which read as the button doing nothing.
export const forceRotateSignupKey = (adminId: string): Promise<{ key: string; expiresAt: string }> =>
  rotate(adminId);

export const validateSignupKey = async (candidate: string): Promise<boolean> => {
  const current = await getCurrentSignupKey();

  if (!current || isExpired(current.expires_at)) {
    return false;
  }

  const expected = Buffer.from(current.key_value);
  const actual = Buffer.from(candidate);

  // Both are fixed at 8 bytes by the zod schema before this runs, but guard
  // the length anyway: timingSafeEqual throws on mismatched buffer sizes
  // rather than returning false.
  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
};
