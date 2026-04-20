import { cn } from '@/utils/cn';
import { getValueByPath } from '@/utils/getValueByPath';
import { Pagination } from './Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './TableAtoms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import type { DataTableProps, PaginationProps } from './types';

export function DataTable<T>({ 
  data, 
  headerMap, 
  className,
  paginationProps 
}: DataTableProps<T> & { paginationProps?: PaginationProps }) {
  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-fit max-h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                {headerMap.map((col, idx) => (
                  <TableHead key={idx}>{col.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {headerMap.map((col, colIdx) => {
                      const rawValue = getValueByPath(item, col.keyItem);
                      const renderedValue = col.parseItem ? col.parseItem(rawValue, item) : String(rawValue ?? '');

                      return (
                        <TableCell key={colIdx}>
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
          <Pagination {...paginationProps} />
        )}
      </div>
    </TooltipProvider>
  );
}
