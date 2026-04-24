import { AdminLayout } from '@/features/admin/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProductFormPage } from '@/features/product/pages/ProductFormPage';
import { ProductListPage } from '@/features/product/pages/ProductListPage';
import { RoleFormPage } from '@/features/role/pages/RoleFormPage';
import { RoleListPage } from '@/features/role/pages/RoleListPage';
import { UserFormPage } from '@/features/user/pages/UserFormPage';
import { UserListPage } from '@/features/user/pages/UserListPage';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import React, { useEffect } from 'react';
import { ErrorPage } from '@/components/ui/ErrorPage';

const ProtectedRoute = ({ children, feature, action }: { 
  children: React.ReactNode, 
  feature?: string, 
  action?: 'view' | 'create' | 'delete' | 'activate' 
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (feature && action && !hasPermission(feature, action)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div className="p-4">Dashboard</div>,
      },
      { path: 'roles', element: <ProtectedRoute feature="role" action="view"><RoleListPage /></ProtectedRoute> },
      { path: 'roles/new', element: <ProtectedRoute feature="role" action="create"><RoleFormPage /></ProtectedRoute> },
      { path: 'roles/update/:id', element: <ProtectedRoute feature="role" action="create"><RoleFormPage /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute feature="user" action="view"><UserListPage /></ProtectedRoute> },
      { path: 'users/new', element: <ProtectedRoute feature="user" action="create"><UserFormPage /></ProtectedRoute> },
      { path: 'users/update/:id', element: <ProtectedRoute feature="user" action="create"><UserFormPage /></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute feature="product" action="view"><ProductListPage /></ProtectedRoute> },
      { path: 'products/new', element: <ProtectedRoute feature="product" action="create"><ProductFormPage /></ProtectedRoute> },
      { path: 'products/update/:id', element: <ProtectedRoute feature="product" action="create"><ProductFormPage /></ProtectedRoute> },
    ],
  },
]);

export function AppRoutes() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <RouterProvider router={router} />
  );
}
