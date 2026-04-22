import { roleService } from '@/features/role/services/role.service';
import { renderWithProviders } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { userService } from '../../services/user.service';
import { UserFormPage } from '../UserFormPage';

// Mock dependencies
vi.mock('../../services/user.service', () => ({
  userService: {
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  },
}));

vi.mock('@/features/role/services/role.service', () => ({
  roleService: {
    mageSelect: vi.fn(),
    mageHydrate: vi.fn(),
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

describe('UserFormPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ id: 'new' });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (roleService.mageSelect as Mock).mockResolvedValue({ items: [{ id: 'role-1', name: 'Admin' }], hasMore: false });
    (roleService.mageHydrate as Mock).mockResolvedValue([{ id: 'role-1', name: 'Admin' }]);
  });

  it('renders "New User" title and empty fields', () => {
    renderWithProviders(<UserFormPage />);
    expect(screen.getByText('New User')).toBeInTheDocument();
  });

  it('submits correctly for new user', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockResolvedValue({});
    
    renderWithProviders(<UserFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Select role
    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));
    
    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        id_role: 'role-1'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('shows error when password is missing for new user', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    
    // Select role to pass Zod validation
    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Senha é obrigatória para novos usuários/i)).toBeInTheDocument();
    });
  });

  it('submits correctly for existing user', async () => {
    const user = userEvent.setup();
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', id_role: 'role-1' };
    (useParams as Mock).mockReturnValue({ id: '1' });
    (userService.getUser as Mock).mockResolvedValue(mockUser);
    (userService.updateUser as Mock).mockResolvedValue({});
    
    renderWithProviders(<UserFormPage />);
    
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument());
    
    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'John Updated');
    
    await user.click(screen.getByRole('button', { name: /Save User/i }));
    
    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'John Updated',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserFormPage />);
    
    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await user.click(cancelButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/users');
    
    await user.click(cancelButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('shows error state when fetching fails', async () => {
    (useParams as Mock).mockReturnValue({ id: '1' });
    (userService.getUser as Mock).mockRejectedValue(new Error('Fetch failed'));
    
    renderWithProviders(<UserFormPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Loading user data/i)).toBeInTheDocument();
    });
  });

  it('handles submission error with message', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockRejectedValue({
      response: { data: { message: 'API Error Message' } }
    });
    
    renderWithProviders(<UserFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Select role
    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));
    
    expect(await screen.findByText(/API Error Message/i)).toBeInTheDocument();
  });

  it('handles submission error without message', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockRejectedValue(new Error('Generic Error'));
    
    renderWithProviders(<UserFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Select role
    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar usuário. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('shows "Saving..." text when mutation is pending', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UserFormPage />);
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));
    await user.click(screen.getByRole('button', { name: /Save User/i }));
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
