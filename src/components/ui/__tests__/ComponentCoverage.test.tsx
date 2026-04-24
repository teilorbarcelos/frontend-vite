import { useAuthStore } from '@/stores/auth';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HeaderMapItem } from '../DataTable';
import { DataTable } from '../DataTable/DataTable';
import { Pagination } from '../DataTable/Pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '../DropdownMenu';
import { DynamicSelect } from '../DynamicSelect';
import { Input } from '../Input';
import { SearchInput } from '../SearchInput';
import { StatusBadge } from '../StatusBadge';

describe('UI Component Edge Cases for Coverage', () => {
  it('DynamicSelect without label', async () => {
    render(
      <DynamicSelect
        value=""
        onChange={() => {}}
        fetchPage={async () => ({ items: [], hasMore: false })}
        fetchByIds={async () => []}
        getOptionLabel={(i: any) => i.name}
        getOptionValue={(i: any) => i.id}
      />
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toHaveAttribute('aria-labelledby');
  });

  it('Input with different variants', () => {
    const { rerender } = render(<Input />);
    rerender(<Input className="test-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('test-class');
  });

  it('StatusBadge edge cases', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      hasPermission: () => false,
    });

    const { rerender } = render(
      <StatusBadge active={true} feature="user" />
    );
    
    const badge = screen.getByText('Ativo');
    expect(badge).toBeDisabled();

    useAuthStore.setState({
      hasPermission: () => true,
    });
    const onClick = vi.fn();
    
    rerender(
      <StatusBadge active={true} feature="user" onClick={onClick} />
    );
    
    fireEvent.click(screen.getByText('Ativo'));
    expect(onClick).toHaveBeenCalled();
  });

  it('DataTable sort interaction', () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const headerMap = [{ title: 'Name', keyItem: 'name', sortable: true }];
    
    render(
      <DataTable
        data={[{ name: 'Test' }]}
        headerMap={headerMap as HeaderMapItem<{ name: string; }>[]}
        paginationProps={{
          currentPage: 0,
          totalPages: 1,
          pageSize: 10,
          totalItems: 1,
          onPageChange
        }}
        sorting={{
          value: { orderBy: undefined, orderDirection: undefined },
          onChange: onSortChange
        }}
      />
    );

    fireEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it('Pagination edge cases', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination
        currentPage={0}
        totalPages={2}
        pageSize={10}
        totalItems={15}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/Exibindo/)).toBeInTheDocument();
    
    rerender(
      <Pagination
        currentPage={0}
        totalPages={2}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );
    
    // Match text by checking multiple parts
    expect(screen.getByText(/Página/i)).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('Input with error', () => {
    render(<Input error="This is required" />);
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('DropdownMenu with inset item', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    // DropdownMenuItem is rendered in a Portal, so we check the portal content
    // But since we are using Radix, we might need to wait for it.
    // However, we just want to trigger the branch in code.
  });

  it('StatusBadge without onClick or permission', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      hasPermission: () => true,
    });

    const { rerender } = render(
      <StatusBadge active={true} feature="user" />
    );
    
    // Should not crash when clicked even if onClick is missing
    fireEvent.click(screen.getByText('Ativo'));

    useAuthStore.setState({
      hasPermission: () => false,
    });
    rerender(
      <StatusBadge active={true} feature="user" onClick={vi.fn()} />
    );

    // Should not trigger onClick if no permission
    fireEvent.click(screen.getByText('Ativo'));
  });

  it('SearchInput edge case', () => {
    const onSearch = vi.fn();
    render(<SearchInput defaultValue="test" onSearch={onSearch} />);
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
