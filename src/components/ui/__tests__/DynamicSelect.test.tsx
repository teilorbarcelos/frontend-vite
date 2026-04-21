import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DynamicSelect } from '../DynamicSelect';

interface TestItem {
  id: string;
  name: string;
}

describe('DynamicSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    (global as any).clearObservers();
  });

  const mockItems: TestItem[] = [
    { id: '1', name: 'Option 1' },
    { id: '2', name: 'Option 2' },
  ];

  const mockFetchPage = vi.fn().mockResolvedValue({
    items: mockItems,
    hasMore: false,
  });

  const mockFetchByIds = vi.fn().mockResolvedValue([]);

  const defaultProps = {
    label: 'Test Select',
    placeholder: 'Select an option',
    fetchPage: mockFetchPage,
    fetchByIds: mockFetchByIds,
    getOptionLabel: (item: TestItem) => item.name,
    getOptionValue: (item: TestItem) => item.id,
    onChange: vi.fn(),
  };

  it('renders with label and placeholder', () => {
    render(<DynamicSelect {...defaultProps} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('opens popover and triggers fetchPage on open', async () => {
    render(<DynamicSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(mockFetchPage).toHaveBeenCalled();
    });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    render(<DynamicSelect {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByText('Option 1'));
    
    fireEvent.click(screen.getByText('Option 1'));
    
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('filters options when searching', async () => {
    render(<DynamicSelect {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByPlaceholderText('Pesquisar...'));
    
    const input = screen.getByPlaceholderText('Pesquisar...');
    fireEvent.change(input, { target: { value: 'Search term' } });

    await waitFor(() => {
      expect(mockFetchPage).toHaveBeenCalledWith(
        expect.any(Number),
        'Search term',
        expect.anything()
      );
    });
  });

  it('handles multiple selection', async () => {
    const onChange = vi.fn();
    render(<DynamicSelect {...defaultProps} multiple onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByText('Option 1'));
    
    fireEvent.click(screen.getByText('Option 1'));
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['1']);
    });
  });

  it('removes an item in multiple selection mode', async () => {
    const onChange = vi.fn();
    mockFetchByIds.mockResolvedValueOnce([{ id: '1', name: 'Option 1' }]);
    
    render(<DynamicSelect {...defaultProps} multiple value={['1']} onChange={onChange} />);
    
    // Wait for hydration
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
    
    // Find the remove button for Option 1
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  it('triggers loadMore when scrolling to bottom', async () => {
    mockFetchPage.mockResolvedValueOnce({
      items: mockItems,
      hasMore: true,
    });

    render(<DynamicSelect {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByText('Option 1'));

    // Trigger intersection
    (global as any).fireIntersection(true);

    await waitFor(() => {
      expect(mockFetchPage).toHaveBeenCalledTimes(2);
    });
  });

  it('does not trigger loadMore if already loading or no more items', async () => {
    mockFetchPage.mockResolvedValueOnce({ items: mockItems, hasMore: false });
    render(<DynamicSelect {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Option 1'));

    // Trigger intersection with hasMore = false
    (global as any).fireIntersection(true);
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
  });

  it('handles empty value correctly', () => {
    render(<DynamicSelect {...defaultProps} value={undefined} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('does not re-initialize on second open', async () => {
    render(<DynamicSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger); // Open 1
    await waitFor(() => expect(mockFetchPage).toHaveBeenCalledTimes(1));
    
    fireEvent.click(trigger); // Close
    fireEvent.click(trigger); // Open 2
    
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
  });

  it('renders loading state inside popover', async () => {
    // Mock a slow response
    mockFetchPage.mockReturnValueOnce(new Promise(() => {}));
    render(<DynamicSelect {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders empty state when no items found', async () => {
    mockFetchPage.mockResolvedValueOnce({ items: [], hasMore: false });
    render(<DynamicSelect {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument();
    });
  });

  it('handles single selection correctly (uncontrolled)', async () => {
    const onChange = vi.fn();
    render(<DynamicSelect {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 1'));
    
    expect(onChange).toHaveBeenCalledWith('1');
    expect(screen.getByText('Option 1')).toBeInTheDocument(); // Trigger shows the label
    expect(screen.queryByPlaceholderText('Pesquisar...')).not.toBeInTheDocument(); // Popover closed
  });

  it('renders error state correctly', () => {
    render(<DynamicSelect {...defaultProps} error="Field is required" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('border-red-500');
  });

  it('normalizes single string value to array internally', async () => {
    mockFetchByIds.mockResolvedValueOnce([{ id: '1', name: 'Option 1' }]);
    render(<DynamicSelect {...defaultProps} value="1" />);
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('handles null and empty string values', () => {
    const { rerender } = render(<DynamicSelect {...defaultProps} value="1" />);
    rerender(<DynamicSelect {...defaultProps} value={null as any} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
    
    rerender(<DynamicSelect {...defaultProps} value="" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('handles multiple mode with zero items selected', () => {
    render(<DynamicSelect {...defaultProps} multiple value={[]} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });
});
