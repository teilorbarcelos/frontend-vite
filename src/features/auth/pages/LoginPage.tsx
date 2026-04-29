import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { authMutations } from '../hooks/auth.mutations';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const forgotPasswordSchema = z.object({
  email: z.email('E-mail inválido'),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const loginMutation = authMutations.useLogin();
  const requestResetMutation = authMutations.useRequestReset();

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        login(res.token, res.refreshToken, res.user);
        navigate('/dashboard');
      },
    });
  };

  const onForgotSubmit = (data: ForgotPasswordForm) => {
    requestResetMutation.mutate(data.email, {
      onSuccess: () => {
        setIsForgotPassword(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isForgotPassword ? 'Recuperar Senha' : 'Acesse sua conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isForgotPassword 
              ? 'Digite seu e-mail para receber as instruções' 
              : 'Bem-vindo de volta ao Admin Panel'}
          </p>
        </div>

        {!isForgotPassword ? (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
              />
              <div className="space-y-1">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              isLoading={loginMutation.isPending}
            >
              Entrar
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              {...forgotForm.register('email')}
              error={forgotForm.formState.errors.email?.message}
            />

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                isLoading={requestResetMutation.isPending}
              >
                Enviar Instruções
              </Button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar para o login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
