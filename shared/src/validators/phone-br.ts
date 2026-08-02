const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const normalizePhoneBR = onlyDigits;

export const isValidPhoneBR = (raw: string): boolean => {
  const digits = onlyDigits(raw);

  if (digits.length !== 10 && digits.length !== 11) {
    return false;
  }

  const areaCode = digits.slice(0, 2);
  if (areaCode[0] === '0') {
    return false;
  }

  const isMobile = digits.length === 11;
  const firstSubscriberDigit = digits[2];

  if (isMobile && firstSubscriberDigit !== '9') {
    return false;
  }

  return true;
};

export const formatPhoneBR = (raw: string): string => {
  const digits = onlyDigits(raw).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  const areaCode = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${areaCode}) ${rest}`;
  }

  const isMobile = digits.length > 10;
  const splitIndex = isMobile ? 5 : 4;
  const subscriberFirst = rest.slice(0, splitIndex);
  const subscriberSecond = rest.slice(splitIndex);

  return subscriberSecond
    ? `(${areaCode}) ${subscriberFirst}-${subscriberSecond}`
    : `(${areaCode}) ${subscriberFirst}`;
};
