import React from 'react';
import { useForm } from 'react-hook-form';
import { Filter, RotateCcw } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter
} from './Drawer';
import { Button } from './Button';
import { Input } from './Input';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'text' | 'number';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FilterField[];
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  fields, 
  onFilter,
  initialValues = {} 
}: FilterDrawerProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues
  });

  // Sincroniza apenas quando o drawer abre ou quando o initialValues muda externamente
  React.useEffect(() => {
    reset(initialValues);
  }, [isOpen, initialValues, reset]);

  const handleClear = () => {
    reset({});
    onFilter({});
    onClose();
  };

  const onSubmit = (data: Record<string, unknown>) => {
    const processedFilters: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      processedFilters[key] = value;
    });

    onFilter(processedFilters);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <DrawerTitle>Filtros Avançados</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              
              {field.type === 'dateRange' ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    className="flex-1"
                    {...register(`${field.name}_start`)}
                  />
                  <span className="text-gray-400 text-sm">até</span>
                  <Input
                    type="date"
                    className="flex-1"
                    {...register(`${field.name}_end`)}
                  />
                </div>
              ) : field.type === 'select' ? (
                <select
                  {...register(field.name)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                >
                  <option value="">Todos</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              )}
            </div>
          ))}
        </div>

        <DrawerFooter>
          <Button 
            type="button" 
            variant="ghost" 
            className="flex-1"
            onClick={handleClear}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button 
            type="button" 
            className="flex-1"
            onClick={handleSubmit(onSubmit)}
          >
            Filtrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
