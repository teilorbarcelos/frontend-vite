import { describe, it, expect, vi, afterEach } from 'vitest';
import { getProductColumns } from '../productHeaderMap';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth';
import React from 'react';

describe('ProductHeaderMap', () => {
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

  it('renders price column correctly', () => {
    const columns = getProductColumns(mockFn, mockFn, mockFn, permissions);
    const priceCol = columns.find(c => c.keyItem === 'price');
    
    if (priceCol?.parseItem) {
      expect(priceCol.parseItem(100.5, {} as any)).toBe('$100.50');
      expect(priceCol.parseItem(null, {} as any)).toBe('$0.00');
      expect(priceCol.parseItem(undefined, {} as any)).toBe('$0.00');
    }
  });

  it('renders status column correctly and handles toggle', () => {
    const onToggleStatus = vi.fn();
    const columns = getProductColumns(onToggleStatus, mockFn, mockFn, permissions);
    const statusCol = columns.find(c => c.keyItem === 'active');
    
    if (statusCol?.parseItem) {
      const product = { id: '123', active: true };
      renderWithAuth(statusCol.parseItem(true, product as any) as React.ReactElement);
      
      const badge = screen.getByText('Ativo');
      expect(badge).toBeInTheDocument();
      
      fireEvent.click(badge);
      expect(onToggleStatus).toHaveBeenCalledWith('123', false);
    }
  });

  it('renders actions column correctly', () => {
    const columns = getProductColumns(mockFn, mockFn, mockFn, permissions);
    const actionsCol = columns.find(c => c.title === '');
    
    if (actionsCol?.parseItem) {
      renderWithAuth(actionsCol.parseItem('1', { id: '1' } as any) as React.ReactElement);
      expect(screen.getByRole('button')).toBeInTheDocument();
    }
  });

  it('handles lack of permissions', () => {
    const noPermissions = { canUpdate: false, canDelete: false };
    const columns = getProductColumns(mockFn, mockFn, mockFn, noPermissions);
    const actionsCol = columns.find(c => c.title === '');
    
    if (actionsCol?.parseItem) {
      renderWithAuth(actionsCol.parseItem('1', { id: '1' } as any) as React.ReactElement);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    }
  });
});
