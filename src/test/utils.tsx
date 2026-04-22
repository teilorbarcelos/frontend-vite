import { AuthContext } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

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
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: { id: '1', name: 'Admin', permissions: [] } },
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
