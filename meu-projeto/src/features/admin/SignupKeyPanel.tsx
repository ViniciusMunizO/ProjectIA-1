import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useSignupKeyPanel } from './useSignupKeyPanel';

const formatRemaining = (expiresAt: string): string => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return 'expirada';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const SignupKeyPanel = () => {
  const { key, expiresAt, error, isLoading, isRotating, rotate } = useSignupKeyPanel();
  const [, forceTick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => forceTick((tick) => tick + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (): Promise<void> => {
    if (!key) {
      return;
    }
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-h)]">Chave de acesso para autocadastro</h2>
        <Button variant="ghost" onClick={() => void rotate()} disabled={isLoading || isRotating}>
          {isRotating ? <Spinner className="size-4" /> : 'Atualizar'}
        </Button>
      </div>

      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : key && expiresAt ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-[var(--code-bg)] px-3 py-2 font-mono text-lg tracking-[0.2em] text-[var(--text-h)]">
            {key}
          </span>
          <Button variant="solid" onClick={() => void handleCopy()}>
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <span className="text-xs tabular-nums text-[var(--text)]">
            Expira em {formatRemaining(expiresAt)}
          </span>
        </div>
      ) : (
        <Spinner className="size-4 text-[var(--text)]" />
      )}

      <p className="text-xs text-[var(--text)]">
        Repasse esta chave a quem deve criar uma conta. Ela é renovada automaticamente a cada 30
        minutos.
      </p>
    </div>
  );
};
