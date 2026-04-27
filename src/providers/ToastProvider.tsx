import {
  ToastProvider as RadixToastProvider,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProgress,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/Toast';
import type { Toast } from '@/stores/toast';
import { useToastStore } from '@/stores/toast';
import React, { type ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useToastStore();

  return (
    <RadixToastProvider swipeDirection="right">
      {children}
      
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
      
      <ToastViewport />
    </RadixToastProvider>
  );
}

export const ToastItem = React.memo(({ toast, removeToast }: { toast: Toast; removeToast: (id: string) => void }) => {
  const [open, setOpen] = React.useState(true);

  // Sincroniza o fechamento do Radix com a remoção da store de forma estável
  const handleOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    setTimeout(() => removeToast(toast.id), 500);
  }, [removeToast, toast.id]);

  return (
    <ToastRoot 
      open={open} 
      variant={toast.variant} 
      duration={toast.duration}
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
      <ToastProgress duration={toast.duration} variant={toast.variant} />
    </ToastRoot>
  );
});
