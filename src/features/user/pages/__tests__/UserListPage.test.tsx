import { useAuthStore } from '@/stores/auth';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { renderWithProviders } from '@/test/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { userService } from '../../services/user.service';
import { UserListPage } from '../UserListPage';

// Mock dependencies
vi.mock('../../services/user.service', () => ({
  userService: {
    getUsers: vi.fn(),
    deleteUser: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('UserListPage', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', active: true, created_at: '2023-01-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: false, created_at: '2023-01-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (userService.getUsers as Mock).mockResolvedValue({
      items: mockUsers,
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

  it('renders page title and user data', async () => {
    renderWithProviders(<UserListPage />);
    
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('navigates to create user page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserListPage />);
    
    const newButton = screen.getByText('Novo Usuário');
    await user.click(newButton);
  });

  it('shows error state if fetch fails', async () => {
    (userService.getUsers as Mock).mockRejectedValue(new Error('Fetch failed'));
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuários')).toBeInTheDocument();
    });
  });

  it('triggers delete mutation when delete is clicked', async () => {
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockResolvedValue({});
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    
    // 1. Open the actions menu
    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);
    
    // 2. Click "Excluir" in the dropdown
    const deleteOption = await screen.findByText('Excluir');
    await user.click(deleteOption);
    
    // 3. Confirm in the Modal
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockResolvedValue({});
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    
    // The StatusBadge is a button with text "Ativo" or "Inativo"
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(userService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserListPage />);
    
    const filterButton = screen.getByText('Filtros');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Limpar'); // or some other way to close
    // FilterDrawer has a reset button that calls onFilter({}) and onClose()
    await user.click(closeButton);
    expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument();
  });

  it('shows badge when filters are active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserListPage />);
    
    const filterButton = screen.getByText('Filtros');
    await user.click(filterButton);
    
    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'true');
    
    const applyButton = screen.getByText('Aplicar');
    await user.click(applyButton);
    
    // Wait for drawer to close
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
    renderWithProviders(<UserListPage />);
    
    const searchInput = screen.getByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');
    
    // Search is debounced (300ms)
    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('handles toggle status mutation error', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockRejectedValue({
      response: { data: { message: 'Toggle failed' } }
    });
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Toggle failed')).toBeInTheDocument();
    });
  });

  it('navigates to edit user page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    
    // Open menu and click edit
    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);
    
    const editOption = await screen.findByText('Editar');
    await user.click(editOption);
  });

  it('handles delete mutation error without response message', async () => {
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockRejectedValue({});
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao excluir usuário.')).toBeInTheDocument();
    });
  });

  it('handles toggle status mutation error without response message', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockRejectedValue(new Error('Network error'));
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => screen.getByText('John Doe'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetching fails', async () => {
    (userService.getUsers as Mock).mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(<UserListPage />);
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuários')).toBeInTheDocument();
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
      hasPermission: (f, a) => !(f === 'user' && a === 'create'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <ToastProvider>
            <MemoryRouter>
              <UserListPage />
            </MemoryRouter>
          </ToastProvider>
        </LoadingProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Usuários')).toBeInTheDocument());
    expect(screen.queryByText(/Novo Usuário/i)).not.toBeInTheDocument();
  });
});
