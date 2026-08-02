import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

// A fixed hash used to run a real argon2.verify against, when the account
// looked up by email does not exist. Keeps login timing the same whether
// or not the account is real, so failure never leaks account existence.
const DUMMY_HASH = await argon2.hash('dummy-password-for-timing-safety', ARGON2_OPTIONS);

export const hashPassword = (plain: string): Promise<string> => argon2.hash(plain, ARGON2_OPTIONS);

export const verifyPassword = (hash: string | null, plain: string): Promise<boolean> =>
  argon2.verify(hash ?? DUMMY_HASH, plain);
