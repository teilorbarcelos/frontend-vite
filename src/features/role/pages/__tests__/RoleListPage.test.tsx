import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleListPage } from '../RoleListPage';
import { renderWithProviders } from '@/test/utils';
import { roleService } from '../../services/role.service';

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
    (roleService.getRoles as vi.Mock).mockResolvedValue({
      items: mockRoles,
      total: 2,
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
    (roleService.deleteRole as vi.Mock).mockResolvedValue({});
    renderWithProviders(<RoleListPage />);
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));
    await waitFor(() => expect(roleService.deleteRole).toHaveBeenCalledWith('1'));
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (roleService.toggleStatus as vi.Mock).mockResolvedValue({});
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
    (roleService.deleteRole as vi.Mock).mockRejectedValue({
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
    (roleService.toggleStatus as vi.Mock).mockRejectedValue(new Error('Toggle failed'));
    renderWithProviders(<RoleListPage />);
    
    await waitFor(() => screen.getByText('Admin'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetching fails', async () => {
    (roleService.getRoles as vi.Mock).mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(<RoleListPage />);
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar roles')).toBeInTheDocument();
    });
  });
});
