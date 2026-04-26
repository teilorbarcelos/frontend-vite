import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBaseMutation } from '../useBaseMutation';
import { TestWrapper } from '@/test/utils';

describe('useBaseMutation', () => {
  it('should handle successMessage as a function', async () => {
    const successMessage = vi.fn((data: any) => `Success ${data.name}`);
    const mutationFn = vi.fn().mockResolvedValue({ name: 'Test' });

    const { result } = renderHook(() => useBaseMutation({
      mutationFn,
      successMessage,
    }), { wrapper: TestWrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(successMessage).toHaveBeenCalledWith({ name: 'Test' }, {});
  });

  it('should handle missing invalidateQueries', async () => {
    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(() => useBaseMutation({
      mutationFn,
    }), { wrapper: TestWrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should handle generic error message in onError', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Generic Error'));

    const { result } = renderHook(() => useBaseMutation({
      mutationFn,
    }), { wrapper: TestWrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should handle error with response but no message', async () => {
    const error = new Error('Error') as any;
    error.response = { data: {} };
    const mutationFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useBaseMutation({
      mutationFn,
      errorMessage: 'Fallback Error',
    }), { wrapper: TestWrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
