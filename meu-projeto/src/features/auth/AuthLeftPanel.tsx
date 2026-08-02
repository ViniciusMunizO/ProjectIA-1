import { useState } from 'react';
import { PillTag } from '../../components/ui/PillTag';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

type Mode = 'login' | 'signup';

const HEADLINE: Record<Mode, string> = {
  login: 'Entre na sua conta.',
  signup: 'Crie sua conta.',
};

const SUBTEXT: Record<Mode, string> = {
  login: 'Gerencie seus cadastros com segurança, em um só lugar.',
  signup: 'Leva menos de um minuto para começar.',
};

export const AuthLeftPanel = () => {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <div className="flex min-h-svh w-full flex-col bg-[var(--panel-bg)] px-6 py-8 sm:px-10 md:w-[52%] md:px-16 md:py-10">
      <span className="text-sm font-semibold tracking-tight text-[var(--panel-text)]">
        meu-projeto
      </span>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="flex max-w-md flex-col gap-8">
          <div className="flex flex-col gap-3">
            <PillTag>{mode === 'login' ? 'Acesso' : 'Cadastro'}</PillTag>
            <h1 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[var(--panel-text)] sm:text-5xl">
              {HEADLINE[mode]}
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-[var(--panel-muted)]">
              {SUBTEXT[mode]}
            </p>
          </div>

          <div key={mode} className="animate-fade-in-up">
            {mode === 'login' ? (
              <LoginForm onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
