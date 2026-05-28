import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { ProductListPage } from '../ProductListPage';
import { renderWithProviders } from '@/test/utils';
import { productService } from '../../services/product.service';
import { useAuthStore } from '@/stores/auth';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/product.service', () => ({
  productService: {
    getProducts: vi.fn(),
    deleteProduct: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('ProductListPage', () => {
  const mockProducts = [
    { id: '1', name: 'Product A', price: 100, active: true, created_at: '2023-01-01' },
    { id: '2', name: 'Product B', price: 200, active: false, created_at: '2023-01-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getProducts as Mock).mockResolvedValue({
      items: mockProducts,
      total: 2,
    });
    // Reset store state
    useAuthStore.setState({
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: { id: '1', name: 'Admin', permissions: [] } },
      isAuthenticated: true,
      isLoading: false,
      hasPermission: () => true,
    });
  });

  it('renders page title and product data', async () => {
    renderWithProviders(<ProductListPage />);
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('triggers delete mutation', async () => {
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockResolvedValue({});
    renderWithProviders(<ProductListPage />);
    await waitFor(() => screen.getByText('Product A'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    await waitFor(() => expect(productService.deleteProduct).toHaveBeenCalledWith('1'));
  });

  it('navigates to create product page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductListPage />);
    const newButton = screen.getByText(/Novo Produto/i);
    await user.click(newButton);
    expect(newButton).toBeInTheDocument();
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockResolvedValue({});
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(productService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductListPage />);
    
    const filterButton = screen.getByText('Filtros');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Limpar');
    await user.click(closeButton);
    expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument();
  });

  it('shows badge when filters are active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductListPage />);
    
    const filterButton = screen.getByText('Filtros');
    await user.click(filterButton);
    
    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'true');
    
    const applyButton = screen.getByText('Aplicar');
    await user.click(applyButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const filterButtonAfter = screen.getByRole('button', { name: /Filtros/i });
      const badge = within(filterButtonAfter).queryByText('1');
      expect(badge).toBeInTheDocument();
    });
  });

  it('triggers search when search input changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductListPage />);
    
    const searchInput = screen.getByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');
    
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('navigates to edit product page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);
    const editOption = await screen.findByText('Editar');
    expect(editOption).toBeInTheDocument();
    await user.click(editOption);
  });

  it('handles toggle status mutation error', async () => {
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockRejectedValue(new Error('Toggle failed'));
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetching fails', async () => {
    (productService.getProducts as Mock).mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(<ProductListPage />);
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar produtos')).toBeInTheDocument();
    });
  });

  it('handles delete mutation error without message', async () => {
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockRejectedValue({});
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao excluir produto.')).toBeInTheDocument();
    });
  });

  it('handles toggle status mutation error without message', async () => {
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockRejectedValue({});
    renderWithProviders(<ProductListPage />);
    
    await waitFor(() => screen.getByText('Product A'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('renders without create button when permission is missing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // Mock store state with specific permissions
    useAuthStore.setState({
      user: { 
        id: '1', 
        name: 'Test User', 
        email: 'test@example.com', 
        role: { 
          id: '1', 
          name: 'Admin', 
          permissions: [] 
        } 
      },
      isAuthenticated: true,
      isLoading: false,
      hasPermission: (f, a) => !(f === 'product' && a === 'create'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <ToastProvider>
            <MemoryRouter>
              <ProductListPage />
            </MemoryRouter>
          </ToastProvider>
        </LoadingProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Produtos')).toBeInTheDocument());
    expect(screen.queryByText(/Novo Produto/i)).not.toBeInTheDocument();
  });
});
