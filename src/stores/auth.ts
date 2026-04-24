import { create } from 'zustand';
import { api } from '@/lib/axios';
import { getRolePermissions } from '@/utils/validation';

export interface Permission {
  feature: string;
  view: boolean;
  create: boolean;
  delete: boolean;
  activate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Permission[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (feature: string, action: keyof Omit<Permission, 'feature'>) => boolean;
}

export const hasPermission = (user: User | null, feature: string, action: keyof Omit<Permission, 'feature'>): boolean => {
  if (!user || !user.role) return false;
  const permissions = getRolePermissions(user.role) as Permission[];
  const permission = permissions.find(p => p.feature === feature);
  return permission ? !!permission[action] : false;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false 
  }),

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/v1/auth/me');
      const user = res.data.user as User;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  hasPermission: (feature, action) => hasPermission(get().user, feature, action),
}));

export const resetAuthStore = () => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
};
