const MAX_DECIMAL_PLACES = 4;

// Lets people type either "," or "." as the decimal separator (pt-BR vs
// en-US keyboards) in a plain text input, while keeping the stored value
// dot-formatted so Number()/zod's z.coerce.number() parse it directly.
export const sanitizeDecimalInput = (raw: string): string => {
  const digitsAndSeparators = raw.replace(/[^\d.,]/g, '');
  const firstSeparatorIndex = digitsAndSeparators.search(/[.,]/);

  if (firstSeparatorIndex === -1) {
    return digitsAndSeparators;
  }

  const integerPart = digitsAndSeparators.slice(0, firstSeparatorIndex);
  const decimalPart = digitsAndSeparators
    .slice(firstSeparatorIndex + 1)
    .replace(/[.,]/g, '')
    .slice(0, MAX_DECIMAL_PLACES);

  return `${integerPart}.${decimalPart}`;
};
