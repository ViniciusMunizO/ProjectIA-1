import { assert, describe, test } from 'poku';
import { formatPhoneBR, isValidPhoneBR } from './phone-br.js';

describe('isValidPhoneBR', () => {
  test('accepts a valid mobile number (11 digits, starts with 9)', () => {
    assert(isValidPhoneBR('(11) 98888-7777'), 'formatted mobile should be valid');
    assert(isValidPhoneBR('11988887777'), 'digits-only mobile should be valid');
  });

  test('accepts a valid landline number (10 digits)', () => {
    assert(isValidPhoneBR('(11) 3888-7777'), 'formatted landline should be valid');
  });

  test('rejects an 11-digit number that does not start with 9', () => {
    assert(!isValidPhoneBR('11888887777'), 'non-mobile-marked 11-digit number should be rejected');
  });

  test('rejects an area code starting with 0', () => {
    assert(!isValidPhoneBR('01988887777'), 'area code starting with 0 should be rejected');
  });

  test('rejects the wrong length', () => {
    assert(!isValidPhoneBR('123'), 'too short should be rejected');
    assert(!isValidPhoneBR('119888877771'), 'too long should be rejected');
  });
});

describe('formatPhoneBR', () => {
  test('renders the mobile mask', () => {
    assert.strictEqual(formatPhoneBR('11988887777'), '(11) 98888-7777');
  });

  test('renders the landline mask', () => {
    assert.strictEqual(formatPhoneBR('1138887777'), '(11) 3888-7777');
  });

  test('formats a partial input progressively', () => {
    assert.strictEqual(formatPhoneBR('11'), '11');
    assert.strictEqual(formatPhoneBR('1198'), '(11) 98');
  });
});
