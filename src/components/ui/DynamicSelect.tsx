import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useMageSelect } from 'mage-select-data-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from './Button';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

interface DynamicSelectProps<T> {
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  fetchPage: (page: number, search: string, options: { searchFields?: string[]; signal?: AbortSignal }) => Promise<{ items: T[]; hasMore: boolean }>;
  fetchByIds: (ids: string[]) => Promise<T[]>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string;
  startPage?: number;
  searchFields?: string[];
  error?: string;
}

export function DynamicSelect<T extends { id: string | number }>({
  label,
  placeholder = "Selecione...",
  multiple = false,
  value,
  onChange,
  fetchPage,
  fetchByIds,
  getOptionLabel,
  getOptionValue,
  startPage,
  searchFields,
  error,
}: DynamicSelectProps<T>) {
  const [open, setOpen] = useState(false);
  
  const {
    state,
    engine,
  } = useMageSelect<T>({
    fetchPage,
    fetchByIds,
    getId: getOptionValue,
    startPage,
    searchFields,
  });

  const [prevValue, setPrevValue] = useState<string | string[] | undefined>(undefined);

  if (JSON.stringify(value) !== JSON.stringify(prevValue)) {
    setPrevValue(value);
    const ids = Array.isArray(value) ? value : value ? [value] : [];
    engine.setValue(ids);
  }

  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && state.hasMore && !state.isLoading) {
            engine.loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      observerRef.current = observer;
    }
  }, [state.hasMore, state.isLoading, engine]);

  const handleSelect = (item: T) => {
    if (multiple) {
      engine.toggleSelection(item);
      setTimeout(() => {
        const currentSelected = engine.getState().selectedItems;
        onChange(currentSelected.map(getOptionValue));
      }, 0);
    } else {
      engine.setValue([getOptionValue(item)]);
      onChange(getOptionValue(item));
      setOpen(false);
    }
  };

  const handleRemove = (item: T) => {
    engine.toggleSelection(item);
    setTimeout(() => {
      const currentSelected = engine.getState().selectedItems;
      onChange(currentSelected.map(getOptionValue));
    }, 0);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !state.initialized && !state.isLoading) {
      engine.initialLoad();
    }
  };

  const displayValue = multiple 
    ? placeholder 
    : state.selectedItems[0] ? getOptionLabel(state.selectedItems[0]) : placeholder;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal bg-white h-10 px-3 py-2 border-gray-300",
              !state.selectedItems.length && "text-gray-400",
              error && "border-red-500",
              "hover:bg-gray-50 transition-colors"
            )}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="flex flex-col max-h-[300px] bg-white rounded-md shadow-lg border border-gray-200">
            <div className="flex items-center border-b px-3 sticky top-0 bg-white z-10">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Pesquisar..."
                defaultValue={state.search}
                onChange={(e) => engine.setSearch(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto flex-1 py-1">
              {state.items.length === 0 && !state.isLoading && (
                <div className="py-6 text-center text-sm text-gray-500">Nenhum resultado encontrado.</div>
              )}
              
              {state.items.map((item) => {
                const isSelected = state.selectedItems.some(s => getOptionValue(s) === getOptionValue(item));
                return (
                  <div
                    key={getOptionValue(item)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors",
                      isSelected ? "bg-indigo-50 text-indigo-900" : "hover:bg-gray-100 text-gray-700"
                    )}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex-1 truncate">
                      {getOptionLabel(item)}
                    </div>
                    {isSelected && <Check className="ml-2 h-4 w-4 text-indigo-600" />}
                  </div>
                );
              })}
              
              {state.isLoading && (
                <div className="py-3 text-center">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
              )}
              <div ref={observerTarget} className="h-4 w-full" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {multiple && state.selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {state.selectedItems.map((item) => (
            <div
              key={getOptionValue(item)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
            >
              {getOptionLabel(item)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="hover:text-indigo-900 transition-colors p-0.5 rounded-full hover:bg-indigo-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
