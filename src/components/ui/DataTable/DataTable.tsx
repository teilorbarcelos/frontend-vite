import { cn } from '@/utils/cn';
import { getValueByPath } from '@/utils/getValueByPath';
import {

  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import { Pagination } from './Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './TableAtoms';
import type { DataTableProps, SortDirection } from './types';

export function DataTable<T>({
  data,
  headerMap,
  className,
  paginationProps,
  isLoading,
  sorting,
  totalItems
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!sorting?.onChange) return;

    let nextDirection: SortDirection = 'asc';

    if (sorting.value.orderBy === key) {
      if (sorting.value.orderDirection === 'asc') nextDirection = 'desc';
      else if (sorting.value.orderDirection === 'desc') nextDirection = undefined;
    }

    sorting.onChange({
      orderBy: nextDirection ? key : undefined,
      orderDirection: nextDirection
    });

    if (paginationProps?.onPageChange) {
      paginationProps.onPageChange(0);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn('relative flex flex-col h-fit max-h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] transition-all animate-in fade-in">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                {headerMap.map((col, idx) => {
                  const isSorted = sorting?.value.orderBy === col.keyItem;

                  return (
                    <TableHead
                      key={col.keyItem || `col-${idx}`}
                      onClick={() => col.sortable && handleSort(col.keyItem)}
                      className={cn(
                        col.sortable && "cursor-pointer select-none hover:bg-gray-50 transition-colors group"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{col.title}</span>
                        {col.sortable && (
                          <span className={cn(
                            "transition-colors",
                            isSorted ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-400"
                          )}>
                            {isSorted ? (
                              <ArrowUpDown className="w-4 h-4 transition-transform duration-200 data-[state=asc]:rotate-0 data-[state=desc]:rotate-180" data-state={sorting.value.orderDirection} />
                            ) : (
                              <ArrowUpDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, rowIdx) => (
                  <TableRow key={String((item as { id?: string | number }).id || `row-${rowIdx}`)}>
                    {headerMap.map((col, colIdx) => {
                      const rawValue = getValueByPath(item, col.keyItem);
                      const renderedValue = col.parseItem ? col.parseItem(rawValue, item) : String(rawValue ?? '');

                      return (
                        <TableCell key={col.keyItem || `cell-${colIdx}`}>
                          {col.truncate ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[300px] truncate cursor-help">
                                  {renderedValue}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-xs wrap-break-word">
                                  {renderedValue}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            renderedValue
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headerMap.length} className="h-24 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {paginationProps && (
          <Pagination 
            {...paginationProps} 
            totalItems={totalItems ?? paginationProps.totalItems}
            totalPages={totalItems && paginationProps.pageSize 
              ? Math.ceil(totalItems / paginationProps.pageSize) 
              : (paginationProps.totalPages || 0)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
