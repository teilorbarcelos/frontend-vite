import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLoading, LoadingContext } from '../useLoading';
import React from 'react';

describe('useLoading', () => {
  it('throws error when used outside of LoadingProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLoading())).toThrow('useLoading must be used within a LoadingProvider');
    spy.mockRestore();
  });

  it('returns context when used within LoadingProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoadingContext.Provider value={{ showLoading: vi.fn(), hideLoading: vi.fn() }}>
        {children}
      </LoadingContext.Provider>
    );
    
    const { result } = renderHook(() => useLoading(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.showLoading).toBeDefined();
  });
});
