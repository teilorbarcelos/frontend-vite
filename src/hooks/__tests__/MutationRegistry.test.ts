import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createMutationRegistry } from '../MutationRegistry';
import { TestWrapper } from '@/test/utils';

describe('MutationRegistry', () => {
  const mockService = {
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    toggleStatus: vi.fn(),
  };

  it('should use default messages if none provided', async () => {
    const registry = createMutationRegistry({
      queryKey: 'users',
      service: mockService as any,
      name: 'user',
    });

    mockService.createUser.mockResolvedValue({ id: '1' });

    const { result } = renderHook(() => registry.useSave(false), { wrapper: TestWrapper });
    
    result.current.mutate({ name: 'Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockService.createUser).toHaveBeenCalled();
  });

  it('should handle capitalizeName option', () => {
    const registry = createMutationRegistry({
      queryKey: 'users',
      service: mockService as any,
      name: 'user',
      capitalizeName: 'Usuario',
    });

    expect(registry.useSave).toBeDefined();
  });

  it('should cover branches for update messages without custom messages', async () => {
    const registry = createMutationRegistry({
      queryKey: 'users',
      service: mockService as any,
      name: 'user',
    });

    mockService.updateUser.mockResolvedValue({ id: '1' });
    const { result } = renderHook(() => registry.useSave(true, '1'), { wrapper: TestWrapper });
    result.current.mutate({ name: 'Test' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should cover branches for delete and toggleStatus default messages', async () => {
    const registry = createMutationRegistry({
      queryKey: 'users',
      service: mockService as any,
      name: 'user',
    });

    mockService.deleteUser.mockResolvedValue(undefined);
    const { result: delResult } = renderHook(() => registry.useDelete(), { wrapper: TestWrapper });
    delResult.current.mutate('1');
    await waitFor(() => expect(delResult.current.isSuccess).toBe(true));

    mockService.toggleStatus.mockResolvedValue(undefined);
    const { result: toggleResult } = renderHook(() => registry.useToggleStatus(), { wrapper: TestWrapper });
    toggleResult.current.mutate({ id: '1', active: true });
    await waitFor(() => expect(toggleResult.current.isSuccess).toBe(true));
  });

  it('should cover branches when onSuccess is provided in options', async () => {
    const registry = createMutationRegistry({
      queryKey: 'users',
      service: mockService as any,
      name: 'user',
    });

    const onSuccess = vi.fn();

    mockService.createUser.mockResolvedValue({ id: '1' });
    const { result: saveResult } = renderHook(() => registry.useSave(false, undefined, { onSuccess }), { wrapper: TestWrapper });
    saveResult.current.mutate({ name: 'Test' });
    await waitFor(() => expect(saveResult.current.isSuccess).toBe(true));

    mockService.deleteUser.mockResolvedValue(undefined);
    const { result: delResult } = renderHook(() => registry.useDelete({ onSuccess }), { wrapper: TestWrapper });
    delResult.current.mutate('1');
    await waitFor(() => expect(delResult.current.isSuccess).toBe(true));

    mockService.toggleStatus.mockResolvedValue(undefined);
    const { result: toggleResult } = renderHook(() => registry.useToggleStatus({ onSuccess }), { wrapper: TestWrapper });
    toggleResult.current.mutate({ id: '1', active: true });
    await waitFor(() => expect(toggleResult.current.isSuccess).toBe(true));
    
    expect(onSuccess).toHaveBeenCalledTimes(3);
  });
});
