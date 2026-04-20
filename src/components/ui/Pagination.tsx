import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  total: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  pageSizeOptions?: number[];
}

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100];

export function Pagination({ 
  page, 
  total, 
  size, 
  onPageChange, 
  onSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
}: PaginationProps) {
  const totalPages = Math.ceil(total / size) || 1;

  const handlePrevious = () => {
    if (page > 0) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) onPageChange(page + 1);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button variant="secondary" onClick={handlePrevious} disabled={page === 0}>
          Previous
        </Button>
        <Button variant="secondary" onClick={handleNext} disabled={page >= totalPages - 1}>
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min(page * size + 1, total)}</span> to{' '}
            <span className="font-medium">
              {Math.min((page + 1) * size, total)}
            </span>{' '}
            of <span className="font-medium">{total}</span> results
          </p>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={size}
              onChange={(e) => {
                onSizeChange(Number(e.target.value));
                onPageChange(0); // Reset to first page on size change
              }}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={page === 0}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 bg-white">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
