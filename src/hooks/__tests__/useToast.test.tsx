import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToast, ToastContext } from '../useToast';
import React from 'react';

describe('useToast', () => {
  it('throws error when used outside of ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });

  it('returns context when used within ToastProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContext.Provider value={{ toast: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }}>
        {children}
      </ToastContext.Provider>
    );
    
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.success).toBeDefined();
  });
});
