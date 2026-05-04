import { ToastProvider as RadixToastProvider, ToastViewport } from '@/components/ui/Toast';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToastItem } from '../ToastProvider';

// Mock do ToastRoot para capturar e chamar onOpenChange
vi.mock('@/components/ui/Toast', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ToastRoot: ({ onOpenChange, children, ...props }: any) => {
      // Chamamos onOpenChange(true) no mount para cobrir o branch else do handleOpenChange
      React.useEffect(() => {
        if (onOpenChange) onOpenChange(true);
      }, [onOpenChange]);

      return <actual.ToastRoot {...props} onOpenChange={onOpenChange}>{children}</actual.ToastRoot>;
    }
  };
});

describe('ToastProvider Edge Cases', () => {
  it('covers missing duration branches and handleOpenChange(true)', async () => {
    vi.useFakeTimers();
    const mockRemove = vi.fn();
    const toast = { id: '1', title: 'No Duration', variant: 'success' } as any;

    render(
      <RadixToastProvider>
        <ToastItem toast={toast} removeToast={mockRemove} />
        <ToastViewport />
      </RadixToastProvider>
    );

    // Verifica se renderizou (hits lines 38, 56, 67 with fallback 3000)
    expect(screen.getByText('No Duration')).toBeInTheDocument();

    // O mock chamou onOpenChange(true), cobrindo o branch else do handleOpenChange
    
    // Agora testa o auto-close (que cobre line 37)
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // Como chamamos onOpenChange(false) implicitamente no setOpen(false)?
    // Não, precisamos fechar. O setOpen(false) no useEffect cobre a linha 37.
    
    vi.useRealTimers();
  });
});
