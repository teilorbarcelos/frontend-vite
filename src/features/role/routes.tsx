import { ProtectedRoute } from '@/components/ProtectedRoute';
import { type RouteObject } from 'react-router-dom';
import { RoleFormPage } from './pages/RoleFormPage';
import { RoleListPage } from './pages/RoleListPage';

export const roleRoutes: RouteObject[] = [
  { 
    path: 'roles', 
    element: (
      <ProtectedRoute feature="role" action="view">
        <RoleListPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'roles/new', 
    element: (
      <ProtectedRoute feature="role" action="create">
        <RoleFormPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'roles/update/:id', 
    element: (
      <ProtectedRoute feature="role" action="create">
        <RoleFormPage />
      </ProtectedRoute>
    ) 
  },
];
