const CNPJ_LENGTH = 14;

const ALL_DIGITS_EQUAL = /^(\d)\1+$/;

const onlyDigits = (value: string): string => value.replace(/\D/g, '');

const checkDigit = (digits: string, weights: readonly number[]): number => {
  let sum = 0;

  for (let index = 0; index < weights.length; index += 1) {
    sum += Number(digits[index]) * weights[index]!;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export const isValidCnpj = (raw: string): boolean => {
  const digits = onlyDigits(raw);

  if (digits.length !== CNPJ_LENGTH || ALL_DIGITS_EQUAL.test(digits)) {
    return false;
  }

  const firstCheck = checkDigit(digits.slice(0, 12), FIRST_WEIGHTS);
  const secondCheck = checkDigit(digits.slice(0, 12) + firstCheck, SECOND_WEIGHTS);

  return firstCheck === Number(digits[12]) && secondCheck === Number(digits[13]);
};

export const formatCnpj = (raw: string): string => {
  const digits = onlyDigits(raw).slice(0, CNPJ_LENGTH);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 8)].filter(Boolean);
  const branch = digits.slice(8, 12);
  const suffix = digits.slice(12, 14);

  let result = parts.join('.');
  if (branch) {
    result += `/${branch}`;
  }
  if (suffix) {
    result += `-${suffix}`;
  }
  return result;
};

export const normalizeCnpj = onlyDigits;
