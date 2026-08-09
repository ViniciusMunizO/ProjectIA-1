import { Navigate, Route, Routes } from 'react-router';
import { USER_ROLES } from '../../../shared/src/types/auth.types';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AuthPage } from '../pages/AuthPage';
import { ClienteNovoPage } from '../pages/ClienteNovoPage';
import { ClientesListagemPage } from '../pages/ClientesListagemPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EstoqueNovoPage } from '../pages/EstoqueNovoPage';
import { EstoqueListagemPage } from '../pages/EstoqueListagemPage';
import { FornecedorNovoPage } from '../pages/FornecedorNovoPage';
import { FornecedoresListagemPage } from '../pages/FornecedoresListagemPage';
import { PedidoNovoPage } from '../pages/PedidoNovoPage';
import { PedidosListagemPage } from '../pages/PedidosListagemPage';
import { ProdutoNovoPage } from '../pages/ProdutoNovoPage';
import { ProdutosListagemPage } from '../pages/ProdutosListagemPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RequireRole } from './RequireRole';

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
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/usuarios"
      element={
        <ProtectedRoute>
          <RequireRole roles={['ADMIN', 'GERENTE']}>
            <AdminUsersPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clientes"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <ClientesListagemPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clientes/novo"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <ClienteNovoPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/produtos"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <ProdutosListagemPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/produtos/novo"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <ProdutoNovoPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/fornecedores"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <FornecedoresListagemPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/fornecedores/novo"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <FornecedorNovoPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/estoque"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <EstoqueListagemPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/estoque/novo"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <EstoqueNovoPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/pedidos"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <PedidosListagemPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/pedidos/novo"
      element={
        <ProtectedRoute>
          <RequireRole roles={USER_ROLES}>
            <PedidoNovoPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
