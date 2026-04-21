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

  const totalPages = Math.ceil(data.length / pageSize);

  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

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
