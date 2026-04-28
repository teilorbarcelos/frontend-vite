import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export const ProtectedRoute = ({ children, feature, action }: { 
  children: React.ReactNode, 
  feature?: string, 
  action?: 'view' | 'create' | 'update' | 'delete' | 'activate' 
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
