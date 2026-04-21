import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTableWithPagination } from '../DataTableWithPagination';
import type { DataTableHeaderMap } from '../types';

describe('DataTableWithPagination', () => {
  const mockData = Array.from({ length: 25 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Item ${i + 1}`,
    email: `item${i + 1}@example.com`,
  }));

  const headerMap: DataTableHeaderMap<typeof mockData[0]>[] = [
    { title: 'Name', keyItem: 'name' },
    { title: 'Email', keyItem: 'email' },
  ];

  it('renders first page of data by default', () => {
    render(
      <DataTableWithPagination 
        data={mockData} 
        headerMap={headerMap} 
        pageSize={10}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
  });

  it('navigates to the next page', () => {
    render(
      <DataTableWithPagination 
        data={mockData} 
        headerMap={headerMap} 
        pageSize={10}
      />
    );

    const nextButton = screen.getByTitle(/Próximo/i);
    fireEvent.click(nextButton);

    expect(screen.queryByText('Item 10')).not.toBeInTheDocument();
    expect(screen.getByText('Item 11')).toBeInTheDocument();
    expect(screen.getByText('Item 20')).toBeInTheDocument();
  });

  it('navigates to the last page', () => {
    render(
      <DataTableWithPagination 
        data={mockData} 
        headerMap={headerMap} 
        pageSize={10}
      />
    );

    const lastButton = screen.getByTitle(/Última página/i);
    fireEvent.click(lastButton);

    expect(screen.queryByText('Item 20')).not.toBeInTheDocument();
    expect(screen.getByText('Item 21')).toBeInTheDocument();
    expect(screen.getByText('Item 25')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(
      <DataTableWithPagination 
        data={[]} 
        headerMap={headerMap} 
      />
    );

    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
  });

  it('handles safePage adjustment when data decreases', () => {
    const { rerender } = render(
      <DataTableWithPagination 
        data={mockData} 
        headerMap={headerMap} 
        pageSize={10}
      />
    );

    // Go to last page (page 2, items 21-25)
    const lastButton = screen.getByRole('button', { name: /Última página/i });
    fireEvent.click(lastButton);
    expect(screen.getByText('Item 21')).toBeInTheDocument();

    // Rerender with less data (only 5 items)
    rerender(
      <DataTableWithPagination 
        data={mockData.slice(0, 5)} 
        headerMap={headerMap} 
        pageSize={10}
      />
    );

    // Should be back on page 0
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 21')).not.toBeInTheDocument();
  });
});
