import { useBaseMutation, type BaseMutationOptions } from './useBaseMutation';

export interface MutationRegistryConfig {
  queryKey: string;
  service: Record<string, (...args: never[]) => Promise<unknown>>;
  name: string;
  capitalizeName?: string;
  messages?: {
    saveSuccess?: (isEditing: boolean) => string;
    deleteSuccess?: string;
    toggleStatusSuccess?: string;
    saveError?: string;
    deleteError?: string;
    toggleStatusError?: string;
    loadingLabel?: string;
  }
}

export type MutationOptions<TData, TVariables> = BaseMutationOptions<TData, TVariables>;

export function createMutationRegistry<TEntity = unknown>(config: MutationRegistryConfig) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const capitalizeName = config.capitalizeName || capitalize(config.name);
  const messages = config.messages;

  return {
    useSave: <TForm = unknown>(isEditing: boolean, id?: string, options?: MutationOptions<TEntity, TForm>) => {
      return useBaseMutation<TEntity, TForm>({
        mutationFn: (data: TForm) => {
          const method = isEditing ? `update${capitalizeName}` : `create${capitalizeName}`;
          const fn = config.service[method] as unknown as (...args: unknown[]) => Promise<TEntity>;
          return isEditing ? fn(id, data) : fn(data);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.saveError,
        showLoadingLabel: messages?.loadingLabel || 'Salvando...',
        ...options,
        successMessage: options?.successMessage || (messages?.saveSuccess?.(isEditing) || (isEditing 
          ? `${capitalizeName} atualizado com sucesso!` 
          : `${capitalizeName} criado com sucesso!`)),
      });
    },

    useDelete: (options?: MutationOptions<void, string>) => {
      return useBaseMutation<void, string>({
        mutationFn: (id: string) => {
          const fn = config.service[`delete${capitalizeName}`] as unknown as (id: string) => Promise<void>;
          return fn(id);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.deleteError,
        ...options,
        successMessage: options?.successMessage || (messages?.deleteSuccess || `${capitalizeName} excluído com sucesso!`),
      });
    },

    useToggleStatus: (options?: MutationOptions<void, { id: string; active: boolean }>) => {
      return useBaseMutation<void, { id: string; active: boolean }>({
        mutationFn: ({ id, active }) => {
          const fn = config.service.toggleStatus as unknown as (id: string, active: boolean) => Promise<void>;
          return fn(id, active);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.toggleStatusError,
        ...options,
        successMessage: options?.successMessage || (messages?.toggleStatusSuccess || 'Status atualizado!'),
      });
    }
  };
}
