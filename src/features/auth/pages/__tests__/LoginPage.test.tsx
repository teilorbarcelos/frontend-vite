import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    requestPasswordReset: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
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

const renderPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
    { wrapper: createWrapper() }
  );
};

describe('LoginPage', () => {
  it('toggles between login and forgot password modes', () => {
    renderPage();
    
    const forgotBtn = screen.getByText('Esqueceu a senha?');
    fireEvent.click(forgotBtn);
    
    expect(screen.getByText('Recuperar Senha')).toBeInTheDocument();
    expect(screen.getByText('Enviar Instruções')).toBeInTheDocument();
    
    const backBtn = screen.getByText('Voltar para o login');
    fireEvent.click(backBtn);
    
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
  });

  it('submits login successfully', async () => {
    const mockUser = { id: '1', email: 'test@t.com', name: 'Test', role: { id: '1', name: 'Admin', permissions: [] } };
    vi.mocked(authService.login).mockResolvedValueOnce({ token: 'tok', refreshToken: 'ref', user: mockUser as any });
    
    renderPage();
    
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@t.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: 'test@t.com', password: 'password123' });
    });
  });

  it('submits forgot password request successfully', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({ message: 'sent' });
    renderPage();
    
    fireEvent.click(screen.getByText('Esqueceu a senha?'));
    
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByText('Enviar Instruções'));
    
    await waitFor(() => {
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
    
    // Should return to login mode on success
    await waitFor(() => {
      expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
    });
  });

  it('shows password visibility toggle', () => {
    renderPage();
    
    const passwordInput = screen.getByLabelText('Senha');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
