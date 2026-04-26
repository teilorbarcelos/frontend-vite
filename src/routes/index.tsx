import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorPage } from '@/components/ui/ErrorPage';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useAuthStore } from '@/stores/auth';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Feature Routes
import { productRoutes } from '@/features/product/routes';
import { roleRoutes } from '@/features/role/routes';
import { userRoutes } from '@/features/user/routes';
// [GENERATE_FEATURE_ROUTES_IMPORT]

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
        <AppLayout />
      </ProtectedRoute>
    ),
    loader: async () => {
      await useAuthStore.getState().checkAuth();
      return null;
    },
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
      ...roleRoutes,
      ...userRoutes,
      ...productRoutes,
      // [GENERATE_FEATURE_ROUTES_SPREAD]
    ],
  },
]);

export function AppRoutes() {
  return (
    <RouterProvider router={router} />
  );
}
