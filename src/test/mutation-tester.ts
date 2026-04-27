import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestWrapper } from './utils';

interface MutationRegistryTestsConfig {
  registry: any;
  service: any;
  entityName: string;
  queryKey: string;
  createData: any;
  updateData: any;
}

export function runMutationRegistryTests(config: MutationRegistryTestsConfig) {
  const { registry, service, entityName, createData, updateData } = config;
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  describe(`${capitalizedEntity} mutations`, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('useSave', () => {
      it(`should call create${capitalizedEntity} when isEditing is false`, async () => {
        const createMethod = `create${capitalizedEntity}`;
        service[createMethod].mockResolvedValue({ id: '1', ...createData });

        const { result } = renderHook(() => registry.useSave(false), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate(createData);
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(service[createMethod]).toHaveBeenCalledWith(createData);
      });

      it(`should call update${capitalizedEntity} when isEditing is true`, async () => {
        const updateMethod = `update${capitalizedEntity}`;
        service[updateMethod].mockResolvedValue({ id: '1', ...updateData });

        const { result } = renderHook(() => registry.useSave(true, '1'), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate(updateData);
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(service[updateMethod]).toHaveBeenCalledWith('1', updateData);
      });

      it('should handle custom onSuccess option', async () => {
        const createMethod = `create${capitalizedEntity}`;
        service[createMethod].mockResolvedValue({ id: '1', ...createData });
        const onSuccess = vi.fn();

        const { result } = renderHook(() => registry.useSave(false, undefined, { onSuccess }), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate(createData);
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(onSuccess).toHaveBeenCalled();
      });

      it('should handle onMutate option', async () => {
        const createMethod = `create${capitalizedEntity}`;
        service[createMethod].mockResolvedValue({ id: '1', ...createData });
        const onMutate = vi.fn();

        const { result } = renderHook(() => registry.useSave(false, undefined, { onMutate }), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate(createData);
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(onMutate).toHaveBeenCalled();
      });
    });

    describe('useDelete', () => {
      it(`should call delete${capitalizedEntity}`, async () => {
        const deleteMethod = `delete${capitalizedEntity}`;
        service[deleteMethod].mockResolvedValue(undefined);

        const { result } = renderHook(() => registry.useDelete(), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate('1');
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(service[deleteMethod]).toHaveBeenCalledWith('1');
      });

      it('should handle onError and custom options', async () => {
        const deleteMethod = `delete${capitalizedEntity}`;
        const error = new Error('Delete failed') as any;
        error.isAxiosError = true;
        error.response = { data: { message: 'Custom error' } };
        service[deleteMethod].mockRejectedValue(error);
        const onError = vi.fn();

        const { result } = renderHook(() => registry.useDelete({ onError }), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate('1');
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(onError).toHaveBeenCalled();
      });
    });

    describe('useToggleStatus', () => {
      it('should call toggleStatus', async () => {
        service.toggleStatus.mockResolvedValue(undefined);

        const { result } = renderHook(() => registry.useToggleStatus(), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate({ id: '1', active: false });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(service.toggleStatus).toHaveBeenCalledWith('1', false);
      });

      it('should handle onSettled', async () => {
        service.toggleStatus.mockResolvedValue(undefined);
        const onSettled = vi.fn();

        const { result } = renderHook(() => registry.useToggleStatus({ onSettled }), { wrapper: TestWrapper });
        
        act(() => {
          result.current.mutate({ id: '1', active: true });
        });

        await waitFor(() => expect(onSettled).toHaveBeenCalled());
      });
    });
  });
}
