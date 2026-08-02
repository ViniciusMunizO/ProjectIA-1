import { Spinner } from '../components/ui/Spinner';

export const AuthLoadingScreen = () => (
  <div className="flex min-h-svh items-center justify-center bg-[var(--panel-bg)]">
    <Spinner className="size-6 text-[var(--panel-text)]" />
  </div>
);
