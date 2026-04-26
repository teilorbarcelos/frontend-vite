import { LoadingProvider } from '@/providers/LoadingProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { useToastStore } from '@/stores/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { type ReactNode } from 'react';
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
  
  // Reset and initialize default store state for tests
  useAuthStore.setState({
    user: { id: '1', name: 'Test User', email: 'test@example.com', role: { id: '1', name: 'Admin', permissions: [] } },
    isAuthenticated: true,
    isLoading: false,
  });

  useLoadingStore.setState({
    isLoading: false,
    message: 'Carregando...',
  });

  useToastStore.setState({
    toasts: [],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <ToastProvider>
          <MemoryRouter>
            {ui}
          </MemoryRouter>
        </ToastProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}
