import type { ReactNode } from 'react';
import { Link } from 'react-router';

type DashboardTileProps = {
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
  readonly to?: string;
};

export const DashboardTile = ({ title, description, icon, to }: DashboardTileProps) => {
  const content = (
    <>
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent)]">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[var(--text-h)]">{title}</span>
        <span className="text-xs text-[var(--text)]">{description}</span>
      </div>
    </>
  );

  const className =
    'flex flex-col items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-left transition-[border-color,box-shadow] duration-150 ease-out';

  if (!to) {
    return (
      <div className={`${className} cursor-not-allowed opacity-60`} aria-disabled="true">
        {content}
        <span className="text-xs font-medium text-[var(--panel-muted)]">Em breve</span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${className} hover:border-[var(--accent-border)] hover:shadow-[var(--shadow)]`}
    >
      {content}
    </Link>
  );
};
