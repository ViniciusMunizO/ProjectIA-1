import { useId, type InputHTMLAttributes } from 'react';

type TextFieldTone = 'panel' | 'default';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly label: string;
  readonly error?: string;
  readonly tone?: TextFieldTone;
};

const TONE_CLASSES: Record<TextFieldTone, { label: string; input: string }> = {
  panel: {
    label: 'text-[var(--panel-muted)]',
    input:
      'bg-white/5 border-[var(--panel-border)] text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]',
  },
  default: {
    label: 'text-[var(--text)]',
    input:
      'bg-transparent border-[var(--border)] text-[var(--text-h)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-bg)]',
  },
};

export const TextField = ({
  label,
  error,
  tone = 'default',
  id,
  className = '',
  ...rest
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={`text-xs font-medium ${toneClasses.label}`}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 rounded-xl border px-3.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 ease-out ${toneClasses.input} ${className}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
