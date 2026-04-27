import { useBaseMutation } from '@/hooks/useBaseMutation';
import { authService } from '../services/auth.service';
import type { LoginPayload, ResetPasswordPayload } from '../types/auth.types';

export const authMutations = {
  useLogin: () => 
    useBaseMutation({
      mutationFn: (data: LoginPayload) => authService.login(data),
      successMessage: 'Bem-vindo de volta!',
      showLoadingLabel: 'Autenticando...',
    }),

  useRequestReset: () =>
    useBaseMutation({
      mutationFn: (email: string) => authService.requestPasswordReset(email),
      successMessage: 'Instruções enviadas para o seu e-mail!',
      showLoadingLabel: 'Enviando e-mail...',
    }),

  useResetPassword: () =>
    useBaseMutation({
      mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
      successMessage: 'Senha alterada com sucesso!',
      showLoadingLabel: 'Alterando senha...',
    }),
};
