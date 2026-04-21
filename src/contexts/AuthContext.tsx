import { api } from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';

interface Permission {
  feature: string;
  view: boolean;
  create: boolean;
  delete: boolean;
  activate: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Permission[];
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (feature: string, action: keyof Omit<Permission, 'feature'>) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const res = await api.get('/v1/auth/me');
        return res.data.user as User;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    queryClient.setQueryData(['auth-user'], userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    queryClient.setQueryData(['auth-user'], null);
    queryClient.clear();
  };

  const hasPermission = (feature: string, action: keyof Omit<Permission, 'feature'>) => {
    if (!user || !user.role) return false;
    const permissions = user.role.permissions || [];
    const permission = permissions.find(p => p.feature === feature);
    return permission ? !!permission[action] : false;
  };

  return (
    <AuthContext.Provider value={{ 
      user: user ?? null, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
