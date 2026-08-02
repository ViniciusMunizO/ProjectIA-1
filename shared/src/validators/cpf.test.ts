import { assert, describe, test } from 'poku';
import { formatCpf, isValidCpf } from './cpf.js';

describe('isValidCpf', () => {
  test('accepts a known-valid CPF, formatted or not', () => {
    assert(isValidCpf('111.444.777-35'), 'formatted CPF should be valid');
    assert(isValidCpf('11144477735'), 'digits-only CPF should be valid');
  });

  test('rejects a CPF with a wrong check digit', () => {
    assert(!isValidCpf('111.444.777-36'), 'wrong check digit should be rejected');
  });

  test('rejects every all-repeated-digit sequence', () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      const repeated = String(digit).repeat(11);
      assert(!isValidCpf(repeated), `${repeated} should be rejected`);
    }
  });

  test('rejects the wrong length', () => {
    assert(!isValidCpf('123'), 'too short should be rejected');
    assert(!isValidCpf('111444777351'), 'too long should be rejected');
    assert(!isValidCpf(''), 'empty should be rejected');
  });
});

describe('formatCpf', () => {
  test('renders the canonical mask', () => {
    assert.strictEqual(formatCpf('11144477735'), '111.444.777-35');
  });

  test('formats a partial input progressively', () => {
    assert.strictEqual(formatCpf('111'), '111');
    assert.strictEqual(formatCpf('111444'), '111.444');
    assert.strictEqual(formatCpf('111444777'), '111.444.777');
  });
});
