import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { authService } from '../../services/auth.service';
import { authMutations } from '../auth.mutations';

vi.mock('../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLoading', () => ({
  useLoading: () => ({
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('authMutations', () => {
  it('useLogin works', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({ token: 'tok', refreshToken: 'rTok', user: {} as any });
    const { result } = renderHook(() => authMutations.useLogin(), { wrapper: createWrapper() });
    
    result.current.mutate({ email: 't@t.com', password: 'p' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useRequestReset works', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({ message: 'sent' });
    const { result } = renderHook(() => authMutations.useRequestReset(), { wrapper: createWrapper() });
    
    result.current.mutate('t@t.com');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useResetPassword works', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValueOnce({ message: 'done' });
    const { result } = renderHook(() => authMutations.useResetPassword(), { wrapper: createWrapper() });
    
    result.current.mutate({ email: 't@t.com', token: '1', password: '2' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
