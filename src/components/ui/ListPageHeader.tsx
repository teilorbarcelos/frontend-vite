import { Plus, Filter } from 'lucide-react';
import { Button } from './Button';
import { SearchInput } from './SearchInput';

interface ListPageHeaderProps {
  title: string;
  onSearch: (value: string) => void;
  onFilterClick: () => void;
  filterCount: number;
  onCreateClick?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
}

export function ListPageHeader({
  title,
  onSearch,
  onFilterClick,
  filterCount,
  onCreateClick,
  createLabel = 'Novo',
  searchPlaceholder,
}: ListPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 shrink-0">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center space-x-4">
        <SearchInput 
          onSearch={onSearch} 
          className="w-80"
          placeholder={searchPlaceholder}
        />
        <Button 
          variant="secondary" 
          onClick={onFilterClick}
          className={filterCount > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {filterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
              {filterCount}
            </span>
          )}
        </Button>
        {onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
