import { AdminLayout } from '@/features/admin/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProductFormPage } from '@/features/product/pages/ProductFormPage';
import { ProductListPage } from '@/features/product/pages/ProductListPage';
import { RoleFormPage } from '@/features/role/pages/RoleFormPage';
import { RoleListPage } from '@/features/role/pages/RoleListPage';
import { UserFormPage } from '@/features/user/pages/UserFormPage';
import { UserListPage } from '@/features/user/pages/UserListPage';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

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

