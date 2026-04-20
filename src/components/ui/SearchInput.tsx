import { useState, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({ 
  onSearch, 
  placeholder = 'Pesquisar...', 
  className,
  defaultValue = '' 
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Função de debounce manual para evitar useEffect
  const debouncedSearch = useCallback((val: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(val);
    }, 500);
  }, [onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onSearch('');
  };

  return (
    <div className={className}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
