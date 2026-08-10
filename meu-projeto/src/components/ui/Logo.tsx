type LogoProps = {
  readonly tone?: 'panel' | 'default';
  readonly className?: string;
};

export const Logo = ({ tone = 'default', className = '' }: LogoProps) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      className="size-7 shrink-0 rounded-lg"
      aria-hidden="true"
    />
    <span
      className={`text-sm font-semibold tracking-tight ${tone === 'panel' ? 'text-[var(--panel-text)]' : 'text-[var(--text-h)]'}`}
    >
      VMO
    </span>
  </span>
);
