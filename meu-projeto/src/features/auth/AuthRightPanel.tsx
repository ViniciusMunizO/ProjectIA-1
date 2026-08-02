export const AuthRightPanel = () => (
  <div
    className="relative hidden overflow-hidden md:block md:w-[48%]"
    style={{
      background:
        'radial-gradient(120% 90% at 15% 10%, color-mix(in oklab, var(--accent) 55%, transparent) 0%, transparent 60%),' +
        'radial-gradient(100% 80% at 90% 90%, color-mix(in oklab, var(--accent) 35%, transparent) 0%, transparent 55%),' +
        'linear-gradient(160deg, #0a0a0c 0%, #17121f 45%, #0a0a0c 100%)',
    }}
  >
    <div
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
      aria-hidden="true"
    />
  </div>
);
