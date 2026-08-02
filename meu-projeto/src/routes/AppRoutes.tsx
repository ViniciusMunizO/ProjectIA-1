import { Navigate, Route, Routes } from 'react-router';
import { AuthPage } from '../pages/AuthPage';
import { CadastroPage } from '../pages/CadastroPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <PublicOnlyRoute>
          <AuthPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/cadastro"
      element={
        <ProtectedRoute>
          <CadastroPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
