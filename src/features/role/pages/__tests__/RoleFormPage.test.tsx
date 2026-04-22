import { renderWithProviders } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { roleService } from '../../services/role.service';
import { RoleFormPage } from '../RoleFormPage';

vi.mock('../../services/role.service', () => ({
  roleService: {
    getRole: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    getFeatures: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('RoleFormPage', () => {
  const mockFeatures = [
    { id: 'f1', name: 'user', description: 'User Management' },
  ];
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ id: 'new' });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (roleService.getFeatures as Mock).mockResolvedValue(mockFeatures);
  });

  it('renders correctly', async () => {
    renderWithProviders(<RoleFormPage />);
    await waitFor(() => {
      expect(screen.getByText('Novo Perfil')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('submits correctly for new role', async () => {
    const user = userEvent.setup();
    (roleService.createRole as Mock).mockResolvedValue({});
    renderWithProviders(<RoleFormPage />);
    
    await waitFor(() => screen.getByLabelText(/Nome do Perfil/i));
    await user.type(screen.getByLabelText(/Nome do Perfil/i), 'Admin');
    await user.type(screen.getByLabelText(/Descrição/i), 'Administrator role');
    
    // Toggle a permission
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // View permission for first feature
    
    await user.click(screen.getByText('Salvar Perfil'));
    await waitFor(() => {
      expect(roleService.createRole).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/roles');
    });
  });

  it('submits correctly in edit mode', async () => {
    const user = userEvent.setup();
    const mockRole = { 
      id: '1', 
      name: 'Existing Role', 
      description: 'Desc',
      RoleFeature: [{ id_feature: 'f1', view: true, create: false, delete: false, activate: false }]
    };
    (useParams as Mock).mockReturnValue({ id: '1' });
    (roleService.getRole as Mock).mockResolvedValue(mockRole);
    (roleService.updateRole as Mock).mockResolvedValue({});

    renderWithProviders(<RoleFormPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nome do Perfil/i)).toHaveValue('Existing Role');
    });
    
    await user.click(screen.getByText('Salvar Perfil'));
    await waitFor(() => {
      expect(roleService.updateRole).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/roles');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleFormPage />);
    
    await waitFor(() => screen.getAllByRole('button', { name: /Cancelar/i }));
    const cancelButtons = screen.getAllByRole('button', { name: /Cancelar/i });
    await user.click(cancelButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/roles');
    
    await user.click(cancelButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('handles submission error with message', async () => {
    const user = userEvent.setup();
    (roleService.createRole as Mock).mockRejectedValue({
      response: { data: { message: 'API Error Message' } }
    });
    
    renderWithProviders(<RoleFormPage />);
    
    await waitFor(() => screen.getByLabelText(/Nome do Perfil/i));
    await user.type(screen.getByLabelText(/Nome do Perfil/i), 'Admin');
    await user.type(screen.getByLabelText(/Descrição/i), 'Desc');

    await user.click(screen.getByText('Salvar Perfil'));
    
    expect(await screen.findByText(/API Error Message/i)).toBeInTheDocument();
  });

  it('handles submission error without message', async () => {
    const user = userEvent.setup();
    (roleService.createRole as Mock).mockRejectedValue(new Error('Generic Error'));
    
    renderWithProviders(<RoleFormPage />);
    
    await waitFor(() => screen.getByLabelText(/Nome do Perfil/i));
    await user.type(screen.getByLabelText(/Nome do Perfil/i), 'Admin');
    await user.type(screen.getByLabelText(/Descrição/i), 'Desc');

    await user.click(screen.getByText('Salvar Perfil'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar perfil. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('shows "Salvando..." text when mutation is pending', async () => {
    const user = userEvent.setup();
    (roleService.createRole as Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RoleFormPage />);
    await waitFor(() => screen.getByLabelText(/Nome do Perfil/i));
    await user.type(screen.getByLabelText(/Nome do Perfil/i), 'Admin');
    await user.type(screen.getByLabelText(/Descrição/i), 'Test Description');
    await user.click(screen.getByText('Salvar Perfil'));
    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });
});
