import { assert, describe, test } from 'poku';
import { checkPasswordStrength } from './password-policy.js';

describe('checkPasswordStrength', () => {
  test('accepts a password meeting every rule', () => {
    const result = checkPasswordStrength('Sup3r$ecureP4ss!');
    assert(result.valid, 'a strong password should be valid');
    assert.strictEqual(result.strength, 'veryStrong');
  });

  test('rejects a password shorter than 10 characters', () => {
    const result = checkPasswordStrength('Ab1$');
    assert(!result.valid, 'a short password should be invalid');
    const minLength = result.rules.find((rule) => rule.id === 'minLength');
    assert(minLength && !minLength.passed, 'minLength rule should fail');
  });

  test('rejects a password containing the user name or e-mail', () => {
    const result = checkPasswordStrength('MariaSilva123!', {
      nome: 'Maria Silva',
      email: 'maria@example.com',
    });
    assert(!result.valid, 'a password containing the name should be invalid');
    const noPersonalInfo = result.rules.find((rule) => rule.id === 'noPersonalInfo');
    assert(noPersonalInfo && !noPersonalInfo.passed, 'noPersonalInfo rule should fail');
  });

  test('rejects a password on the common-password denylist', () => {
    const result = checkPasswordStrength('password123');
    const notCommon = result.rules.find((rule) => rule.id === 'notCommon');
    assert(notCommon && !notCommon.passed, 'notCommon rule should fail');
  });

  test('rejects a password missing a symbol', () => {
    const result = checkPasswordStrength('AbcdefghijkAA11');
    const hasSymbol = result.rules.find((rule) => rule.id === 'hasSymbol');
    assert(hasSymbol && !hasSymbol.passed, 'hasSymbol rule should fail');
  });

  test('evaluates every rule independently, never short-circuiting', () => {
    const result = checkPasswordStrength('');
    assert.strictEqual(result.rules.length, 7, 'all 7 rules should be reported');
  });
});
