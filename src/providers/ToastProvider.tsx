import { shouldTriggerToastRemoval } from '@/utils/validation';
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
import React, { useCallback, type ReactNode } from 'react';
import { useToastStore } from '@/stores/toast';
import type { Toast } from '@/stores/toast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useToastStore();

  return (
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
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    void (shouldTriggerToastRemoval(isOpen) && setTimeout(onRemove, 1000));
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
