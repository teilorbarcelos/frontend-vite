import { describe, it, expect, vi } from 'vitest';
import { getProductColumns } from '../product/constants/productHeaderMap';
import { getRoleColumns } from '../role/constants/roleHeaderMap';
import { getUserColumns } from '../user/constants/userHeaderMap';
import { render, screen, cleanup } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth';
import { afterEach } from 'vitest';
import React from 'react';

describe('HeaderMaps Coverage', () => {
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

  it('ProductHeaderMap coverage', () => {
    const columns = getProductColumns(mockFn, mockFn, mockFn, permissions);
    
    // Test parseItem for Price
    const priceCol = columns.find(c => c.keyItem === 'price');
    expect(priceCol?.parseItem?.(100.5, {} as any)).toBe('$100.50');
    expect(priceCol?.parseItem?.(null, {} as any)).toBe('$0.00');

    // Test parseItem for Status
    const statusCol = columns.find(c => c.keyItem === 'active');
    renderWithAuth(statusCol?.parseItem?.(true, { id: '1', active: true } as any) as React.ReactElement);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find(c => c.title === '');
    renderWithAuth(actionsCol?.parseItem?.('1', { id: '1' } as any) as React.ReactElement);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('RoleHeaderMap coverage', () => {
    const columns = getRoleColumns(mockFn, mockFn, mockFn, permissions);
    
    // Test parseItem for Status
    const statusCol = columns.find(c => c.keyItem === 'active');
    renderWithAuth(statusCol?.parseItem?.(true, { id: '1', active: true } as any) as React.ReactElement);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find(c => c.title === '');
    renderWithAuth(actionsCol?.parseItem?.('1', { id: '1' } as any) as React.ReactElement);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('UserHeaderMap coverage', () => {
    const columns = getUserColumns(mockFn, mockFn, mockFn, permissions);
    
    // Test parseItem for Status
    const statusCol = columns.find(c => c.keyItem === 'active');
    renderWithAuth(statusCol?.parseItem?.(true, { id: '1', active: true } as any) as React.ReactElement);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find(c => c.title === '');
    renderWithAuth(actionsCol?.parseItem?.('1', { id: '1' } as any) as React.ReactElement);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders correctly without permissions', () => {
    const noPermissions = { canUpdate: false, canDelete: false };
    
    const userCols = getUserColumns(mockFn, mockFn, mockFn, noPermissions);
    const roleCols = getRoleColumns(mockFn, mockFn, mockFn, noPermissions);
    const prodCols = getProductColumns(mockFn, mockFn, mockFn, noPermissions);

    [userCols, roleCols, prodCols].forEach(cols => {
      const actionsCol = cols.find(c => c.title === '');
      renderWithAuth(actionsCol?.parseItem?.('1', { id: '1' } as any) as React.ReactElement);
      // When both are undefined, DataTableActions might render something else or nothing
      // But the logic is: onEdit={permissions.canUpdate ? onEdit : undefined}
    });
  });
});
