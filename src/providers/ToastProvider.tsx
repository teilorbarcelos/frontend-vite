import {
  ToastProvider as RadixToastProvider,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProgress,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  type ToastVariant
} from '@/components/ui/Toast';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const success = useCallback((message: string, title: string = 'Sucesso!') => {
    addToast({ description: message, title, variant: 'success' });
  }, [addToast]);

  const error = useCallback((message: string, title: string = 'Erro!') => {
    addToast({ description: message, title, variant: 'error' });
  }, [addToast]);

  const info = useCallback((message: string, title: string = 'Informação') => {
    addToast({ description: message, title, variant: 'info' });
  }, [addToast]);

  const warning = useCallback((message: string, title: string = 'Atenção!') => {
    addToast({ description: message, title, variant: 'warning' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      <RadixToastProvider swipeDirection="right">
        {children}
        
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
        
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Espera a animação de saída terminar antes de remover do estado
      setTimeout(onRemove, 1000);
    }
  }, [onRemove]);

  return (
    <ToastRoot 
      open={open} 
      variant={toast.variant} 
      duration={toast.duration || 3000}
      onOpenChange={handleOpenChange}
    >
      <div className="flex gap-3 items-start">
        <ToastIcon variant={toast.variant} />
        <div className="grid gap-1">
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </div>
      </div>
      <ToastClose />
      <ToastProgress duration={toast.duration || 3000} variant={toast.variant} />
    </ToastRoot>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
