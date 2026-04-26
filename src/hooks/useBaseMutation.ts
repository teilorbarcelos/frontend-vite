import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useLoading } from './useLoading';
import { useToast } from './useToast';

export interface BaseMutationOptions<TData, TVariables, TContext = unknown> extends UseMutationOptions<TData, AxiosError<{ message?: string }>, TVariables, TContext> {
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  invalidateQueries?: QueryKey[];
  showLoadingLabel?: string;
}

export function useBaseMutation<TData = unknown, TVariables = void, TContext = unknown>(
  options: BaseMutationOptions<TData, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { showLoading, hideLoading } = useLoading();

  type OnMutateFn = NonNullable<UseMutationOptions<TData, AxiosError<{ message?: string }>, TVariables, TContext>['onMutate']>;
  type MutationContext = Parameters<OnMutateFn>[1];

  return useMutation({
    ...options,
    onMutate: async (variables: TVariables, context: MutationContext): Promise<TContext> => {
      if (options.showLoadingLabel) {
        showLoading(options.showLoadingLabel);
      }
      if (options.onMutate) {
        return options.onMutate(variables, context) as Promise<TContext> | TContext;
      }
      return undefined as TContext;
    },
    onSuccess: (data: TData, variables: TVariables, result: TContext, context: MutationContext) => {
      hideLoading();
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      if (options.successMessage) {
        const msg = typeof options.successMessage === 'function' 
          ? options.successMessage(data, variables) 
          : options.successMessage;
        success(msg);
      }
      return options.onSuccess?.(data, variables, result, context);
    },
    onError: (err: AxiosError<{ message?: string }>, variables: TVariables, result: TContext | undefined, context: MutationContext) => {
      hideLoading();
      const msg = err.response?.data?.message || options.errorMessage || 'Ocorreu um erro inesperado.';
      toastError(msg);
      return options.onError?.(err, variables, result, context);
    },
    onSettled: (data, error, variables, result, context) => {
      hideLoading();
      return options.onSettled?.(data, error, variables, result, context);
    }
  });
}
