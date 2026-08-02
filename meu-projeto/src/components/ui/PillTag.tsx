import type { ReactNode } from 'react';

type PillTagProps = {
  readonly children: ReactNode;
};

export const PillTag = ({ children }: PillTagProps) => (
  <span className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-xs font-medium text-[var(--panel-text)]">
    {children}
  </span>
);
