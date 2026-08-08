import type {
  PasswordCheckResult,
  PasswordRuleId,
  PasswordStrength,
} from '../../../../shared/src/validators/password-policy';
import { IconCrossfade } from '../../components/ui/IconCrossfade';

type PasswordStrengthMeterProps = {
  readonly result: PasswordCheckResult;
  readonly hasValue: boolean;
};

const RULE_LABELS: Record<PasswordRuleId, string> = {
  minLength: 'Pelo menos 10 caracteres',
  hasUppercase: 'Uma letra maiúscula',
  hasLowercase: 'Uma letra minúscula',
  hasDigit: 'Um número',
  hasSymbol: 'Um símbolo (!@#$...)',
  noPersonalInfo: 'Diferente do seu nome e e-mail',
  notCommon: 'Não é uma senha comum',
};

const STRENGTH_LABEL: Record<PasswordStrength, string> = {
  weak: 'Fraca',
  medium: 'Média',
  strong: 'Forte',
  veryStrong: 'Muito forte',
};

const STRENGTH_BAR_COLOR: Record<PasswordStrength, string> = {
  weak: 'bg-[var(--danger)]',
  medium: 'bg-amber-400',
  strong: 'bg-[var(--success)]',
  veryStrong: 'bg-[var(--success)]',
};

const PendingIcon = () => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 8.2 7.2 10 10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PasswordStrengthMeter = ({ result, hasValue }: PasswordStrengthMeterProps) => {
  const passedCount = result.rules.filter((rule) => rule.passed).length;
  const totalRules = result.rules.length;
  const fillFraction = hasValue ? passedCount / totalRules : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full origin-left rounded-full transition-transform duration-300 ease-out ${STRENGTH_BAR_COLOR[result.strength]}`}
            style={{ transform: `scaleX(${fillFraction})` }}
          />
        </div>
        {hasValue ? (
          <p className="text-xs tabular-nums text-[var(--panel-muted)]">
            Força: {STRENGTH_LABEL[result.strength]}
          </p>
        ) : null}
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {result.rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
              rule.passed ? 'text-[var(--panel-text)]' : 'text-[var(--panel-muted)]'
            }`}
          >
            <IconCrossfade
              showFirst={!rule.passed}
              first={<PendingIcon />}
              second={<CheckIcon />}
              className="size-3.5 shrink-0"
            />
            {RULE_LABELS[rule.id]}
          </li>
        ))}
      </ul>
    </div>
  );
};
