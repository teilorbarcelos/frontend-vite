import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from '../DataTable';
import type { DataTableHeaderMap } from '../types';

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const headerMap: DataTableHeaderMap<typeof mockData[0]>[] = [
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
    const headersWithTruncate: DataTableHeaderMap<typeof mockData[0]>[] = [
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

  it('renders pagination when props are provided', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        headerMap={headerMap} 
        totalItems={100}
        paginationProps={{
          currentPage: 0,
          totalPages: 4,
          pageSize: 25,
          onPageChange,
          onPageSizeChange: vi.fn(),
          totalItems: 100
        }}
      />
    );

    expect(screen.getByText(/Exibindo/)).toBeInTheDocument();
  });
});
