import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'panel' | 'solid' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly isLoading?: boolean;
  readonly children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  panel: 'bg-[var(--panel-text)] text-[var(--panel-bg)] hover:bg-white',
  solid: 'bg-[var(--accent)] text-white hover:brightness-110',
  ghost:
    'bg-transparent text-[var(--text-h)] border border-[var(--border)] hover:bg-black/5',
};

export const Button = ({
  variant = 'solid',
  isLoading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,filter,opacity] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
    {...rest}
  >
    <span
      className={`inline-flex items-center gap-2 transition-opacity duration-150 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
    >
      {children}
    </span>
    {isLoading ? (
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-4" />
      </span>
    ) : null}
  </button>
);
