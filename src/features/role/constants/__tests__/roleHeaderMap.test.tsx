import { describe, it, expect, vi, afterEach } from 'vitest';
import { getRoleColumns } from '../roleHeaderMap';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth';
import React from 'react';

describe('RoleHeaderMap', () => {
  afterEach(() => {
    cleanup();
  });

  const permissions = { canUpdate: true, canDelete: true };
  const mockFn = vi.fn();
  
  // Set default store state
  useAuthStore.setState({
    isAuthenticated: true,
    isLoading: false,
    hasPermission: () => true,
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(ui);
  };

  it('renders status column correctly and handles toggle', () => {
    const onToggleStatus = vi.fn();
    const columns = getRoleColumns(onToggleStatus, mockFn, mockFn, permissions);
    const statusCol = columns.find(c => c.keyItem === 'active');
    
    if (statusCol?.parseItem) {
      const role = { id: '123', active: true };
      renderWithAuth(statusCol.parseItem(true, role as any) as React.ReactElement);
      
      const badge = screen.getByText('Ativo');
      expect(badge).toBeInTheDocument();
      
      fireEvent.click(badge);
      expect(onToggleStatus).toHaveBeenCalledWith('123', false);
    }
  });

  it('renders actions column correctly', () => {
    const columns = getRoleColumns(mockFn, mockFn, mockFn, permissions);
    const actionsCol = columns.find(c => c.title === '');
    
    if (actionsCol?.parseItem) {
      renderWithAuth(actionsCol.parseItem('1', { id: '1' } as any) as React.ReactElement);
      expect(screen.getByRole('button')).toBeInTheDocument();
    }
  });

  it('handles lack of permissions', () => {
    const noPermissions = { canUpdate: false, canDelete: false };
    const columns = getRoleColumns(mockFn, mockFn, mockFn, noPermissions);
    const actionsCol = columns.find(c => c.title === '');
    
    if (actionsCol?.parseItem) {
      renderWithAuth(actionsCol.parseItem('1', { id: '1' } as any) as React.ReactElement);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    }
  });
});
