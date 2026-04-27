import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  authService: {
    validateResetToken: vi.fn(),
    resetPassword: vi.fn(),
  },
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

const renderPage = (params = '?email=test@test.com&token=123') => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false, staleTime: 0 }, 
      mutations: { retry: false } 
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/reset-password${params}`]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ResetPasswordPage', () => {
  it('shows loading state then error if token is invalid', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValueOnce({ valid: false });
    renderPage();
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Link Inválido/i })).toBeInTheDocument();
    });
  });

  it('handles missing email or token in url params', async () => {
    renderPage(''); // no params
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Link Inválido/i })).toBeInTheDocument();
    });
  });

  it('handles validation error from api', async () => {
    vi.mocked(authService.validateResetToken).mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Link Inválido')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Voltar para o Login'));
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows form if token is valid and handles visibility toggles', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValueOnce({ valid: true });
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Nova Senha/i })).toBeInTheDocument();
    });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs[0]).toHaveAttribute('type', 'password');
    expect(passwordInputs[1]).toHaveAttribute('type', 'password');
    
    const toggleBtns = screen.getAllByRole('button', { name: '' }).slice(0, 2);
    
    fireEvent.click(toggleBtns[0]);
    expect(passwordInputs[0]).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleBtns[1]);
    expect(passwordInputs[1]).toHaveAttribute('type', 'text');
  });

  it('submits new password successfully and redirects', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValueOnce({ valid: true });
    vi.mocked(authService.resetPassword).mockResolvedValueOnce({ message: 'success' });
    
    renderPage();
    
    // Wait for the query to resolve
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Nova Senha/i })).toBeInTheDocument();
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'newpassword123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByText('Redefinir Senha'));
    
    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Senha Alterada!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ir para Login Agora'));
    expect(screen.getByText('Login Page')).toBeInTheDocument();

    // Advance timers for the navigate timeout (to clean up)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    vi.useRealTimers();
  });

  it('shows error message if passwords do not match', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValueOnce({ valid: true });
    renderPage();
    
    await waitFor(() => screen.getByRole('heading', { name: /Nova Senha/i }));
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password321' } });
    
    fireEvent.click(screen.getByText('Redefinir Senha'));
    
    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });
  });
});
