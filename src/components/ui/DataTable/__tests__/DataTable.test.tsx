import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from '../DataTable';
import type { HeaderMapItem } from '../types';

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const headerMap: HeaderMapItem<typeof mockData[0]>[] = [
    { title: 'Name', keyItem: 'name', sortable: true },
    { title: 'Email', keyItem: 'email' },
  ];

  it('renders data correctly', () => {
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows empty state when no data is provided', () => {
    render(
      <DataTable 
        data={[]} 
        headerMap={headerMap} 
        totalItems={0}
      />
    );

    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
  });

  it('shows loading indicator', () => {
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
        isLoading={true}
      />
    );

    // Loader2 has a specific class or we can find by container
    expect(screen.getByRole('table').parentElement?.previousSibling).toHaveClass('absolute inset-0');
  });

  it('handles sorting click', () => {
    const onSortChange = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
        sorting={{
          value: { orderBy: 'name', orderDirection: 'asc' },
          onChange: onSortChange
        }}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'desc'
    });
  });

  it('resets sort direction to undefined after desc', () => {
    const onSortChange = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
        sorting={{
          value: { orderBy: 'name', orderDirection: 'desc' },
          onChange: onSortChange
        }}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: undefined,
      orderDirection: undefined
    });
  });

  it('truncates values with tooltip', async () => {
    const headersWithTruncate: HeaderMapItem<typeof mockData[0]>[] = [
      { title: 'Name', keyItem: 'name', truncate: true },
    ];

    render(
      <DataTable 
        data={mockData} 
        headerMap={headersWithTruncate} 
        totalItems={2}
      />
    );

    const truncatedCell = screen.getByText('John Doe');
    expect(truncatedCell).toHaveClass('truncate');
  });

  it('does nothing on header click if sorting is not provided', () => {
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
      />
    );
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    // Should not call any mock or throw error
  });

  it('resets page to 0 when sorting changes', () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={100}
        sorting={{
          value: { orderBy: undefined, orderDirection: undefined },
          onChange: onSortChange
        }}
        paginationProps={{
          currentPage: 2,
          totalPages: 4,
          pageSize: 25,
          onPageChange,
          totalItems: 100
        }}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it('cycles sort direction to undefined', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DataTable
        headerMap={[{ title: 'Name', keyItem: 'name', sortable: true }]}
        data={[{ name: 'Test' }]}
        sorting={{
          value: { orderBy: 'name', orderDirection: 'desc' },
          onChange
        }}
      />
    );
    
    await user.click(screen.getByText('Name'));
    expect(onChange).toHaveBeenCalledWith({
      orderBy: undefined,
      orderDirection: undefined
    });
  });

  it('handles clicking a column that is already active but has no direction', () => {
    const onSortChange = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
        sorting={{
          value: { orderBy: 'name', orderDirection: undefined },
          onChange: onSortChange
        }}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'asc'
    });
  });

  it('renders nothing when no paginationProps is provided', () => {
    const { container } = render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={2}
      />
    );
    expect(container.querySelector('nav')).toBeNull();
  });
});
