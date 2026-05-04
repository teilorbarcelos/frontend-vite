import { create } from 'zustand';
import type { ToastVariant } from '@/components/ui/Toast';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_DURATION = 3000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  toast: (options) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { 
        duration: DEFAULT_DURATION,
        ...options, 
        id 
      }],
    }));
  },

  success: (message, title = 'Sucesso!') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { 
        description: message, 
        title, 
        variant: 'success', 
        duration: DEFAULT_DURATION,
        id 
      }],
    }));
  },

  error: (message, title = 'Erro!') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { 
        description: message, 
        title, 
        variant: 'error', 
        duration: DEFAULT_DURATION,
        id 
      }],
    }));
  },

  info: (message, title = 'Informação') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { 
        description: message, 
        title, 
        variant: 'info', 
        duration: DEFAULT_DURATION,
        id 
      }],
    }));
  },

  warning: (message, title = 'Atenção!') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { 
        description: message, 
        title, 
        variant: 'warning', 
        duration: DEFAULT_DURATION,
        id 
      }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
