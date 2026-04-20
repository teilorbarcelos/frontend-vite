import { useState, useCallback } from 'react';
import type { SortDirection, TableSort } from '@/components/ui/DataTable/types';

interface UseDataTableOptions {
  defaultSize?: number;
  defaultSort?: TableSort;
}

export function useDataTable(options: UseDataTableOptions = {}) {
  const {
    defaultSize = 25,
    defaultSort = { orderBy: 'name', orderDirection: 'asc' as SortDirection }
  } = options;

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(defaultSize);
  const [searchWord, setSearchWord] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sort, setSort] = useState<TableSort>(defaultSort);

  const handleSearch = useCallback((val: string) => {
    setSearchWord(val);
    setPage(0);
  }, []);

  const handleFilter = useCallback((newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleSort = useCallback((newSort: TableSort) => {
    setSort(newSort);
    setPage(0);
  }, []);

  return {

    page,
    size,
    searchWord,
    filters,
    sort,

    setPage,
    setSize,
    setSearchWord,
    setFilters,
    setSort,

    handleSearch,
    handleFilter,
    handleSort,

    tableProps: {
      sorting: { value: sort, onChange: handleSort },
      paginationProps: {
        currentPage: page,
        onPageChange: setPage,
        pageSize: size,
        onPageSizeChange: setSize,
      }
    }
  };
}
