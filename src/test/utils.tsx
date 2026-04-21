import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { ToastProvider } from '@/providers/ToastProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { AuthContext } from '@/contexts/AuthContext';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui: ReactNode) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: { id: '1', name: 'Admin', permissions: [] } } as any,
        isAuthenticated: true,
        isLoading: false,
        login: () => {},
        logout: () => {},
        hasPermission: () => true,
      }}>
        <LoadingProvider>
          <ToastProvider>
            <MemoryRouter>
              {ui}
            </MemoryRouter>
          </ToastProvider>
        </LoadingProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
