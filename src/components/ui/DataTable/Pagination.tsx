import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationProps } from './types';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100];

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize,
  totalItems,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

  if (totalPages <= 1 && !onPageSizeChange) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-6">
          <p className="text-sm text-gray-500">
            {totalItems !== undefined ? (
              <>
                Exibindo <span className="font-medium text-gray-700">{Math.min(currentPage * (pageSize ?? 0) + 1, totalItems)}</span> até{' '}
                <span className="font-medium text-gray-700">
                  {Math.min((currentPage + 1) * (pageSize ?? 0), totalItems)}
                </span>{' '}
                de <span className="font-medium text-gray-700">{totalItems}</span> resultados
              </>
            ) : (
              <>
                Página <span className="font-medium text-gray-700">{currentPage + 1}</span> de{' '}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </>
            )}
          </p>

          {onPageSizeChange && pageSize !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Linhas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(0);
                }}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 bg-white">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Próximo</span>
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
