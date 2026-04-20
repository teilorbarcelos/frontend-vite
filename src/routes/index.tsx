import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { RoleListPage } from '@/features/role/pages/RoleListPage';
import { RoleFormPage } from '@/features/role/pages/RoleFormPage';
import { UserListPage } from '@/features/user/pages/UserListPage';
import { UserFormPage } from '@/features/user/pages/UserFormPage';
import { ProductListPage } from '@/features/product/pages/ProductListPage';
import { ProductFormPage } from '@/features/product/pages/ProductFormPage';

// Proteção de rotas simples
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div className="p-4">Dashboard</div>,
      },
      { path: 'roles', element: <RoleListPage /> },
      { path: 'roles/new', element: <RoleFormPage /> },
      { path: 'roles/update/:id', element: <RoleFormPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/new', element: <UserFormPage /> },
      { path: 'users/update/:id', element: <UserFormPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/update/:id', element: <ProductFormPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

