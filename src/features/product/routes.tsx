import { ProtectedRoute } from '@/components/ProtectedRoute';
import { type RouteObject } from 'react-router-dom';
import { ProductFormPage } from './pages/ProductFormPage';
import { ProductListPage } from './pages/ProductListPage';

export const productRoutes: RouteObject[] = [
  { 
    path: 'products', 
    element: (
      <ProtectedRoute feature="product" action="view">
        <ProductListPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'products/new', 
    element: (
      <ProtectedRoute feature="product" action="create">
        <ProductFormPage />
      </ProtectedRoute>
    ) 
  },
  { 
    path: 'products/update/:id', 
    element: (
      <ProtectedRoute feature="product" action="create">
        <ProductFormPage />
      </ProtectedRoute>
    ) 
  },
];
