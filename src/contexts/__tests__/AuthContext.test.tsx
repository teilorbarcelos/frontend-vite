import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name}</div>
      <button onClick={() => login('token123', { id: '1', name: 'John', email: 'john@test.com', role: { id: '1', name: 'Admin', permissions: [{ feature: 'users', view: true, create: true, delete: false, activate: true }] } } as any)}>Login</button>
      <button onClick={logout}>Logout</button>
      <div data-testid="permission">{hasPermission('users', 'create') ? 'Has Create' : 'No Create'}</div>
      <div data-testid="no-permission">{hasPermission('roles', 'view') ? 'Has View' : 'No View'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides authentication status when token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ data: { user: { id: '1', name: 'John', role: { permissions: [] } } } });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('John');
    });
  });

  it('handles login and logout', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(localStorage.getItem('token')).toBe('token123');
    });

    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  it('handles API error by clearing tokens', async () => {
    localStorage.setItem('token', 'invalid-token');
    (api.get as any).mockRejectedValue(new Error('Invalid token'));

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });

  it('checks permissions correctly', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ 
      data: { 
        user: { 
          id: '1', 
          name: 'John', 
          role: { 
            permissions: [{ feature: 'users', view: true, create: true, delete: false, activate: true }] 
          } 
        } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permission')).toHaveTextContent('Has Create');
      expect(screen.getByTestId('no-permission')).toHaveTextContent('No View');
    });
  });

  it('handles user without permissions array', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ 
      data: { 
        user: { 
          id: '1', 
          name: 'John', 
          role: { permissions: null }
        } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permission')).toHaveTextContent('No Create');
    });
  });

  it('handles user without role', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ 
      data: { 
        user: { 
          id: '1', 
          name: 'John',
          role: null
        } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });

  it('returns false for hasPermission when user is not logged in', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('permission')).toHaveTextContent('No Create');
  });

  it('handles user with undefined permissions', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ 
      data: { 
        user: { 
          id: '1', 
          name: 'John', 
          role: { permissions: undefined }
        } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permission')).toHaveTextContent('No Create');
    });
  });

  it('handles user with null permissions explicitly', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ 
      data: { 
        user: { 
          id: '1', 
          name: 'John', 
          role: { permissions: null }
        } 
      } 
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permission')).toHaveTextContent('No Create');
    });
  });
});
