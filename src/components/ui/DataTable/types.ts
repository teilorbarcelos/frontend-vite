import type { ReactNode } from 'react';

/**
 * Generates a union of strings representing all valid paths to nested properties in T.
 * Supports up to 5 levels of nesting.
 */
export type PathsToString<T, Depth extends number = 5> = [Depth] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${PathsToString<T[K], Prev[Depth]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5];

export type SortDirection = 'asc' | 'desc' | undefined;

export interface TableSort {
  orderBy?: string;
  orderDirection: SortDirection;
}

export interface DataTableSort {
  value: TableSort;
  onChange: (sort: TableSort) => void;
}

export type HeaderMapItem<T> = {
  title: string;
  keyItem: PathsToString<T>;
  parseItem?: (value: unknown, item: T) => ReactNode;
  truncate?: boolean;
  sortable?: boolean;
};

export interface DataTableProps<T> {
  data: T[];
  headerMap: HeaderMapItem<T>[];
  paginated?: boolean;
  className?: string;
  isLoading?: boolean;
  paginationProps?: PaginationProps;
  sorting?: DataTableSort;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableWithPaginationProps<T> {
  data: T[];
  headerMap: HeaderMapItem<T>[];
  pageSize?: number;
  className?: string;
}
