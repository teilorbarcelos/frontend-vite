import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDataTable } from '../useDataTable';

describe('useDataTable', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDataTable());
    
    expect(result.current.page).toBe(0);
    expect(result.current.size).toBe(25);
    expect(result.current.searchWord).toBe('');
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toEqual({ orderBy: 'name', orderDirection: 'asc' });
  });

  it('should initialize with custom options', () => {
    const customSort = { orderBy: 'created_at', orderDirection: 'desc' as const };
    const { result } = renderHook(() => useDataTable({ defaultSize: 50, defaultSort: customSort }));
    
    expect(result.current.size).toBe(50);
    expect(result.current.sort).toEqual(customSort);
  });

  it('should update search and reset page', () => {
    const { result } = renderHook(() => useDataTable());
    
    act(() => {
      result.current.setPage(5);
    });
    expect(result.current.page).toBe(5);
    
    act(() => {
      result.current.handleSearch('test');
    });
    expect(result.current.searchWord).toBe('test');
    expect(result.current.page).toBe(0);
  });

  it('should update filters and reset page', () => {
    const { result } = renderHook(() => useDataTable());
    
    act(() => {
      result.current.setPage(2);
    });
    
    act(() => {
      result.current.handleFilter({ active: true });
    });
    expect(result.current.filters).toEqual({ active: true });
    expect(result.current.page).toBe(0);
  });

  it('should update sort and reset page', () => {
    const { result } = renderHook(() => useDataTable());
    
    act(() => {
      result.current.setPage(3);
    });
    
    const newSort = { orderBy: 'email', orderDirection: 'desc' as const };
    act(() => {
      result.current.handleSort(newSort);
    });
    expect(result.current.sort).toEqual(newSort);
    expect(result.current.page).toBe(0);
  });

  it('should update page and size directly', () => {
    const { result } = renderHook(() => useDataTable());
    
    act(() => {
      result.current.setPage(10);
      result.current.setSize(100);
    });
    
    expect(result.current.page).toBe(10);
    expect(result.current.size).toBe(100);
  });
});
