import * as React from 'react';
import { DataTable } from './DataTable';
import type { DataTableWithPaginationProps } from './types';

export function DataTableWithPagination<T>({
  data,
  headerMap,
  pageSize = 10,
  className,
}: DataTableWithPaginationProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(0);

  // Total pages derived from data
  const totalPages = Math.ceil(data.length / pageSize);
  
  // Ensure we are not on a page that doesn't exist anymore (e.g. after filtering)
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  // If safePage is different from currentPage, we should technically update state, 
  // but the user wants zero useEffect. We can handle it by using safePage for rendering.
  // The next onPageChange will sync it back.

  const paginatedData = React.useMemo(() => {
    const start = safePage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  return (
    <DataTable
      data={paginatedData}
      headerMap={headerMap}
      className={className}
      paginationProps={{
        currentPage: safePage,
        totalPages: totalPages,
        onPageChange: setCurrentPage,
      }}
    />
  );
}
