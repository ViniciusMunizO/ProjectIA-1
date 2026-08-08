import { assert, describe, test } from 'poku';
import { formatCnpj, isValidCnpj } from './cnpj.js';

describe('isValidCnpj', () => {
  test('accepts a known-valid CNPJ, formatted or not', () => {
    assert(isValidCnpj('11.222.333/0001-81'), 'formatted CNPJ should be valid');
    assert(isValidCnpj('11222333000181'), 'digits-only CNPJ should be valid');
  });

  test('rejects a CNPJ with a wrong check digit', () => {
    assert(!isValidCnpj('11.222.333/0001-82'), 'wrong check digit should be rejected');
  });

  test('rejects every all-repeated-digit sequence', () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      const repeated = String(digit).repeat(14);
      assert(!isValidCnpj(repeated), `${repeated} should be rejected`);
    }
  });

  test('rejects the wrong length', () => {
    assert(!isValidCnpj('123'), 'too short should be rejected');
    assert(!isValidCnpj('112223330001812'), 'too long should be rejected');
    assert(!isValidCnpj(''), 'empty should be rejected');
  });
});

describe('formatCnpj', () => {
  test('renders the canonical mask', () => {
    assert.strictEqual(formatCnpj('11222333000181'), '11.222.333/0001-81');
  });

  test('formats a partial input progressively', () => {
    assert.strictEqual(formatCnpj('11'), '11');
    assert.strictEqual(formatCnpj('11222'), '11.222');
    assert.strictEqual(formatCnpj('11222333'), '11.222.333');
    assert.strictEqual(formatCnpj('112223330001'), '11.222.333/0001');
  });
});
