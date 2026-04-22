import { cn } from '@/utils/cn';
import { isPageInRange } from '@/utils/validation';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import type { PaginationProps } from './types';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100];

export function Pagination({
  currentPage,
  totalPages = 0,
  onPageChange,
  pageSize,
  totalItems,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    void (isPageInRange(page, totalPages) && onPageChange(page));
  };

  if (totalPages <= 1 && !onPageSizeChange) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 0) ||
        (i === currentPage + delta + 1 && i < totalPages - 1)
      ) {
        pages.push('...');
      }
    }

    return pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4 px-4 py-4 bg-white border-t border-gray-100 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-6">
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {totalItems !== undefined ? (
              <>
                Exibindo <span className="font-semibold text-gray-900">{Math.min(currentPage * (pageSize ?? 0) + 1, totalItems)}</span> até{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min((currentPage + 1) * (pageSize ?? 0), totalItems)}
                </span>{' '}
                de <span className="font-semibold text-gray-900">{totalItems}</span>
              </>
            ) : (
              <>
                Página <span className="font-semibold text-gray-900">{currentPage + 1}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </>
            )}
          </p>

          {onPageSizeChange && pageSize !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-400 tracking-wider">Linhas:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <span>{pageSize}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[80px]">
                  {pageSizeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => {
                        onPageSizeChange(option);
                        onPageChange(0);
                      }}
                      className={cn(
                        "flex items-center justify-between",
                        pageSize === option && "bg-indigo-50 text-indigo-700 font-semibold"
                      )}
                    >
                      {option}
                      {pageSize === option && <Check className="w-3.5 h-3.5 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <nav className="inline-flex items-center space-x-1" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Primeira página"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1 px-2">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => handlePageChange(Number(page))}
                  className={cn(
                    "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                    isCurrent
                      ? "bg-indigo-50 text-indigo-600 font-bold ring-1 ring-inset ring-indigo-500/20"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {Number(page) + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Última página"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  );
}
