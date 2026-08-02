import { AuthLeftPanel } from '../features/auth/AuthLeftPanel';
import { AuthRightPanel } from '../features/auth/AuthRightPanel';

export const AuthPage = () => (
  <div className="flex min-h-svh w-full">
    <AuthLeftPanel />
    <AuthRightPanel />
  </div>
);
