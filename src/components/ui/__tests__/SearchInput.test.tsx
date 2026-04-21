import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with placeholder', () => {
    render(<SearchInput onSearch={() => {}} placeholder="Search here..." />);
    expect(screen.getByPlaceholderText('Search here...')).toBeInTheDocument();
  });

  it('calls onSearch with debounce', async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Pesquisar...');

    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not be called immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('clears input and calls onSearch immediately', async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} defaultValue="initial" />);
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(screen.getByPlaceholderText('Pesquisar...')).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('cancels previous timeout on new input', async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Pesquisar...');

    fireEvent.change(input, { target: { value: 'a' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    fireEvent.change(input, { target: { value: 'ab' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Total 400ms, should not have been called yet
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('ab');
  });
});
