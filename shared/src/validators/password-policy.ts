export type PasswordRuleId =
  | 'minLength'
  | 'hasUppercase'
  | 'hasLowercase'
  | 'hasDigit'
  | 'hasSymbol'
  | 'noPersonalInfo'
  | 'notCommon';

export type PasswordRuleResult = {
  readonly id: PasswordRuleId;
  readonly passed: boolean;
};

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'veryStrong';

export type PasswordCheckResult = {
  readonly rules: readonly PasswordRuleResult[];
  readonly valid: boolean;
  readonly strength: PasswordStrength;
};

export type PasswordCheckContext = {
  readonly nome?: string;
  readonly email?: string;
};

const MIN_LENGTH = 10;
const SYMBOL_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

// A small, deliberately short stand-in for a real leaked-password check
// (for example the Have I Been Pwned k-anonymity range API). Documented
// as an accepted v1 limitation in the project's security charter.
const COMMON_PASSWORDS = new Set([
  '123456789',
  '1234567890',
  'password',
  'password1',
  'password123',
  'qwertyuiop',
  '12345678910',
  'letmein123',
  'admin12345',
  'welcome123',
  'senha12345',
  'senha123456',
  'brasil12345',
  'iloveyou123',
  'abcdefghij',
  '1q2w3e4r5t',
  'trustno1234',
  'football123',
  'baseball123',
  'dragon12345',
  'monkey12345',
  'master12345',
  'superman123',
  'batman12345',
  'sunshine123',
  '987654321',
  'zxcvbnmasd',
  'qazwsxedc12',
  '1234qwer',
  'changeme123',
]);

const emailLocalPart = (email: string): string => email.split('@')[0] ?? '';

const containsCaseInsensitive = (haystack: string, needle: string): boolean =>
  needle.length > 0 && haystack.toLowerCase().includes(needle.toLowerCase());

const checkRules = (value: string, context: PasswordCheckContext): PasswordRuleResult[] => {
  const nome = context.nome ?? '';
  const emailLocal = context.email ? emailLocalPart(context.email) : '';
  const lowerValue = value.toLowerCase();

  return [
    { id: 'minLength', passed: value.length >= MIN_LENGTH },
    { id: 'hasUppercase', passed: /[A-Z]/.test(value) },
    { id: 'hasLowercase', passed: /[a-z]/.test(value) },
    { id: 'hasDigit', passed: /\d/.test(value) },
    { id: 'hasSymbol', passed: SYMBOL_PATTERN.test(value) },
    {
      id: 'noPersonalInfo',
      passed:
        !containsCaseInsensitive(value, nome) && !containsCaseInsensitive(value, emailLocal),
    },
    { id: 'notCommon', passed: !COMMON_PASSWORDS.has(lowerValue) },
  ];
};

const strengthFromPassedCount = (passedCount: number, ruleCount: number): PasswordStrength => {
  if (passedCount === ruleCount) {
    return 'veryStrong';
  }
  if (passedCount >= ruleCount - 2) {
    return 'strong';
  }
  if (passedCount >= ruleCount - 4) {
    return 'medium';
  }
  return 'weak';
};

export const checkPasswordStrength = (
  value: string,
  context: PasswordCheckContext = {},
): PasswordCheckResult => {
  const rules = checkRules(value, context);
  const passedCount = rules.filter((rule) => rule.passed).length;

  return {
    rules,
    valid: passedCount === rules.length,
    strength: strengthFromPassedCount(passedCount, rules.length),
  };
};
