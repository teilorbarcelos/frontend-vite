import { format, parseISO } from 'date-fns';
import { Filter, RotateCcw } from 'lucide-react';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './Button';
import { DateRangePicker } from './DateRangePicker';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from './Drawer';
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
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: initialValues
  });

  // Sincroniza apenas quando o drawer abre ou quando o initialValues muda externamente
  React.useEffect(() => {
    // Para dateRange, precisamos reconstruir o objeto do initialValues se houver _start/_end
    const formValues: Record<string, unknown> = { ...initialValues };
    
    fields.forEach(field => {
      if (field.type === 'dateRange') {
        const start = initialValues[`${field.name}_start`];
        const end = initialValues[`${field.name}_end`];
        
        if (start || end) {
          formValues[field.name] = {
            from: start ? parseISO(start as string) : undefined,
            to: end ? parseISO(end as string) : undefined
          } as DateRange;
        }
      }
    });

    reset(formValues);
  }, [isOpen, initialValues, reset, fields]);

  const handleClear = () => {
    reset({});
    onFilter({});
    onClose();
  };

  const onSubmit = (data: Record<string, unknown>) => {
    const processedFilters: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      
      // Se for um objeto de dateRange, explode em _start e _end para o backend
      const field = fields.find(f => f.name === key);
      if (field?.type === 'dateRange' && typeof value === 'object') {
        const range = value as DateRange;
        if (range.from) {
          processedFilters[`${key}_start`] = format(range.from, 'yyyy-MM-dd');
        }
        if (range.to) {
          processedFilters[`${key}_end`] = format(range.to, 'yyyy-MM-dd');
        }
        return;
      }

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
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { value, onChange } }) => (
                    <DateRangePicker
                      value={value as DateRange}
                      onChange={onChange}
                    />
                  )}
                />
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
                  type={field.type as string}
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

