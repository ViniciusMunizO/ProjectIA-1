const CPF_LENGTH = 11;

const ALL_DIGITS_EQUAL = /^(\d)\1+$/;

const onlyDigits = (value: string): string => value.replace(/\D/g, '');

const checkDigit = (digits: string, startWeight: number): number => {
  let sum = 0;
  let weight = startWeight;

  for (const digit of digits) {
    sum += Number(digit) * weight;
    weight -= 1;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

export const isValidCpf = (raw: string): boolean => {
  const digits = onlyDigits(raw);

  if (digits.length !== CPF_LENGTH || ALL_DIGITS_EQUAL.test(digits)) {
    return false;
  }

  const firstCheck = checkDigit(digits.slice(0, 9), 10);
  const secondCheck = checkDigit(digits.slice(0, 9) + firstCheck, 11);

  return firstCheck === Number(digits[9]) && secondCheck === Number(digits[10]);
};

export const formatCpf = (raw: string): string => {
  const digits = onlyDigits(raw).slice(0, CPF_LENGTH);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
  const suffix = digits.slice(9, 11);

  const base = parts.join('.');
  return suffix ? `${base}-${suffix}` : base;
};

export const normalizeCpf = onlyDigits;
