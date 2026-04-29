import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, hasPermission, checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name}</div>
      <button onClick={() => login('token123', 'refresh123', { id: '1', name: 'John', email: 'john@test.com', role: { id: '1', name: 'TestRole', permissions: [{ feature: 'users', view: true, create: true, delete: false, activate: true }, { feature: 'roles', view: false, create: false, delete: false, activate: false }] } } as any)}>Login</button>
      <button onClick={logout}>Logout</button>
      <div data-testid="permission">{hasPermission('users', 'create') ? 'Has Create' : 'No Create'}</div>
      <div data-testid="no-permission">{hasPermission('roles', 'view') ? 'Has View' : 'No View'}</div>
    </div>
  );
};

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('provides authentication status when token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    (api.get as any).mockResolvedValue({ data: { user: { id: '1', name: 'John', role: { permissions: [] } } } });

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('John');
    });
  });

  it('handles login and logout', async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(localStorage.getItem('token')).toBe('token123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh123');
    });

    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  it('handles API error by clearing tokens', async () => {
    localStorage.setItem('token', 'invalid-token');
    (api.get as any).mockRejectedValue(new Error('Invalid token'));

    render(<TestComponent />);

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
            permissions: [{ feature: 'users', view: true, create: true, delete: false, activate: true }, { feature: 'roles', view: false, create: false, delete: false, activate: false }] 
          } 
        } 
      } 
    });

    render(<TestComponent />);

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

    render(<TestComponent />);

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

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });

  it('returns false for hasPermission when user is not logged in', async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    expect(screen.getByTestId('permission')).toHaveTextContent('No Create');
  });

  describe('real implementation coverage', () => {
    it('exercises setAuth', () => {
      const { setAuth } = useAuthStore.getState();
      const user = { id: '1', name: 'Test', role: { permissions: [] } } as any;
      setAuth(user);
      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      setAuth(null);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('exercises checkAuth failure', async () => {
      localStorage.setItem('token', 'bad-token');
      (api.get as any).mockRejectedValue(new Error('Auth failed'));
      
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('exercises real hasPermission', () => {
      const user = { 
        id: '1', 
        name: 'Test', 
        role: { 
          id: '1',
          name: 'TestRole',
          permissions: [
            { feature: 'users', view: true, create: false, delete: true, activate: true },
            { feature: 'roles', view: false, create: false, delete: false, activate: false }
          ] 
        } 
      } as any;
      
      useAuthStore.setState({ user, isAuthenticated: true });
      const { hasPermission } = useAuthStore.getState();
      
      expect(hasPermission('users', 'view')).toBe(true);
      expect(hasPermission('users', 'create')).toBe(false);
      expect(hasPermission('roles', 'view')).toBe(false);
      
      useAuthStore.setState({ user: null });
      expect(hasPermission('users', 'view')).toBe(false);

      useAuthStore.setState({ user: { id: '1', role: null } as any });
      expect(hasPermission('users', 'view')).toBe(false);
    });

    it('exercises hasPermission with update fallback', () => {
      const user = { 
        id: '1', 
        name: 'Test', 
        role: { 
          id: '1',
          name: 'TestRole',
          permissions: [
            { feature: 'products', view: true, create: true, delete: true, activate: true },
            { feature: 'categories', view: true, create: false, delete: true, activate: true }
          ] 
        } 
      } as any;
      
      useAuthStore.setState({ user, isAuthenticated: true });
      const { hasPermission } = useAuthStore.getState();
      
      // Caso 1: update não existe, deve usar o valor de create (true)
      expect(hasPermission('products', 'update')).toBe(true);
      
      // Caso 2: update não existe, deve usar o valor de create (false)
      expect(hasPermission('categories', 'update')).toBe(false);

      // Caso 3: update existe explicitamente, deve usar o valor de update (false) mesmo que create seja true
      const userWithExplicitUpdate = {
        ...user,
        role: {
          ...user.role,
          permissions: [
            { feature: 'products', view: true, create: true, update: false, delete: true, activate: true }
          ]
        }
      };
      useAuthStore.setState({ user: userWithExplicitUpdate as any });
      expect(hasPermission('products', 'update')).toBe(false);
    });
  });
});
