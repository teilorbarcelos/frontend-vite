import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { authMutations } from '../hooks/auth.mutations';
import { authService } from '../services/auth.service';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: validationData, isLoading: isValidating } = useQuery({
    queryKey: ['validate-token', email, token],
    queryFn: async () => {
      try {
        return await authService.validateResetToken(email as string, token as string);
      } catch {
        return { valid: false };
      }
    },
    enabled: !!email && !!token,
    retry: false,
  });

  const isTokenValid = validationData?.valid || false;

  const resetMutation = authMutations.useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetMutation.mutate({
      email,
      token,
      password: data.password
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    });
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Senha Alterada!</h2>
          <p className="mt-2 text-gray-600">
            Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.
          </p>
          <Button onClick={() => navigate('/login')} variant="secondary" className="mt-6 w-full">
            Ir para Login Agora
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isTokenValid ? 'Nova Senha' : 'Link Inválido'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isTokenValid 
              ? `Defina sua nova senha de acesso para ${email}`
              : 'O link de recuperação não é mais válido'}
          </p>
        </div>

        {!isTokenValid ? (
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 leading-relaxed">
                Este link de recuperação expirou ou já foi utilizado. Por segurança, os links de recuperação têm validade curta.
              </p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Voltar para o Login
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />
            <Input
              label="Confirmar Nova Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            isLoading={resetMutation.isPending}
          >
            Redefinir Senha
          </Button>
        </form>)}
      </div>
    </div>
  );
}
