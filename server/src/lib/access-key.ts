import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const KEY_LENGTH = 8;

// crypto.randomInt is uniform over [0, ALPHABET.length), unlike
// `Math.random() * n | 0`, which is neither cryptographically secure nor
// unbiased against a non-power-of-two range.
export const generateAccessKey = (): string =>
  Array.from({ length: KEY_LENGTH }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join('');
