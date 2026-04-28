import { ProtectedRoute } from '@/components/ProtectedRoute';
import { type RouteObject } from 'react-router-dom';
import { UserFormPage } from './pages/UserFormPage';
import { UserListPage } from './pages/UserListPage';

export const userRoutes: RouteObject[] = [
  { 
    path: 'users', 
    element: (
      <ProtectedRoute feature="user" action="view">
        <UserListPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'users/new', 
    element: (
      <ProtectedRoute feature="user" action="create">
        <UserFormPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'users/update/:id', 
    element: (
      <ProtectedRoute feature="user" action="update">
        <UserFormPage />
      </ProtectedRoute>
    ) 
  },
];
