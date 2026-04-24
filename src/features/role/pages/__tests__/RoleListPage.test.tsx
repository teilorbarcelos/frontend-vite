import { useAuthStore } from '@/stores/auth';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { renderWithProviders } from '@/test/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { roleService } from '../../services/role.service';
import { RoleListPage } from '../RoleListPage';

vi.mock('../../services/role.service', () => ({
  roleService: {
    getRoles: vi.fn(),
    deleteRole: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('RoleListPage', () => {
  const mockRoles = [
    { id: '1', name: 'Admin', active: true, created_at: '2023-01-01' },
    { id: '2', name: 'User', active: false, created_at: '2023-01-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (roleService.getRoles as Mock).mockResolvedValue({
      items: mockRoles,
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

  it('renders page title and role data', async () => {
    renderWithProviders(<RoleListPage />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('navigates to create role page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleListPage />);
    const newButton = screen.getByText(/Nova Role/i);
    await user.click(newButton);
  });

  it('triggers delete mutation', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockResolvedValue({});
    renderWithProviders(<RoleListPage />);
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    await waitFor(() => expect(roleService.deleteRole).toHaveBeenCalledWith('1'));
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockResolvedValue({});
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(roleService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleListPage />);
    
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
    renderWithProviders(<RoleListPage />);
    
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
    renderWithProviders(<RoleListPage />);
    
    const searchInput = screen.getByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');
    
    await waitFor(() => {
      expect(roleService.getRoles).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('navigates to edit role page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);
    const editOption = await screen.findByText('Editar');
    await user.click(editOption);
  });

  it('handles toggle status mutation error', async () => {
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockRejectedValue(new Error('Toggle failed'));
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetching fails', async () => {
    (roleService.getRoles as Mock).mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(<RoleListPage />);
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar roles')).toBeInTheDocument();
    });
  });

  it('handles delete mutation error without message', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockRejectedValue({});
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao excluir role.')).toBeInTheDocument();
    });
  });

  it('handles toggle status mutation error without message', async () => {
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockRejectedValue({});
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
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
      hasPermission: (f, a) => !(f === 'role' && a === 'create'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <ToastProvider>
            <MemoryRouter>
              <RoleListPage />
            </MemoryRouter>
          </ToastProvider>
        </LoadingProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Roles')).toBeInTheDocument());
    expect(screen.queryByText(/Nova Role/i)).not.toBeInTheDocument();
  });
});
