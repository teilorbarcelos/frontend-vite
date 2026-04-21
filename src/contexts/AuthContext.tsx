import { api } from '@/lib/axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/v1/auth/me');
          setUser(res.data.user);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const hasPermission = (feature: string, action: keyof Omit<Permission, 'feature'>) => {
    if (!user || !user.role) return false;
    const permissions = user.role.permissions || [];
    const permission = permissions.find(p => p.feature === feature);
    return permission ? !!permission[action] : false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
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
