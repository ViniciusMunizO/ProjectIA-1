import { useEffect, useState, type TransitionEvent } from 'react';

export type ToastVariant = 'success' | 'error';

type ToastProps = {
  readonly message: string;
  readonly variant: ToastVariant;
  readonly onDismiss: () => void;
  readonly durationMs?: number;
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  error: 'border-red-400/30 bg-red-500/10 text-red-100',
};

export const Toast = ({ message, variant, onDismiss, durationMs = 4000 }: ToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = setTimeout(() => setVisible(false), durationMs);
    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(dismissTimer);
    };
  }, [durationMs]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>): void => {
    if (event.propertyName === 'opacity' && !visible) {
      onDismiss();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onTransitionEnd={handleTransitionEnd}
      className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-[opacity,transform,filter] ease-[cubic-bezier(0.2,0,0,1)] ${
        visible
          ? 'translate-y-0 scale-100 opacity-100 blur-none duration-300'
          : '-translate-y-3 opacity-0 blur-[4px] duration-150'
      } ${VARIANT_CLASSES[variant]}`}
    >
      <span>{message}</span>
    </div>
  );
};
