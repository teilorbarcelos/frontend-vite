import { format, parseISO } from 'date-fns';
import { Filter } from 'lucide-react';
import { useMemo } from 'react';
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
  const processedValues = useMemo(() => {
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

    return formValues;
  }, [initialValues, fields]);

  const { register, handleSubmit, control } = useForm({
    values: processedValues
  });

  const onSubmit = (data: Record<string, unknown>) => {
    const formattedData: Record<string, unknown> = { ...data };
    
    fields.forEach(field => {
      if (field.type === 'dateRange' && data[field.name]) {
        const range = data[field.name] as DateRange;
        delete formattedData[field.name];
        
        if (range?.from) {
          formattedData[`${field.name}_start`] = format(range.from, 'yyyy-MM-dd');
          formattedData[`${field.name}_end`] = format(range.to || range.from, 'yyyy-MM-dd');
        }
      }
    });

    const cleanData = Object.fromEntries(
      Object.entries(formattedData).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    onFilter(cleanData);
    onClose();
  };

  const handleReset = () => {
    onFilter({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <DrawerTitle>Filtros Avançados</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label 
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                {field.type === 'dateRange' ? (
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { value, onChange } }) => (
                      <DateRangePicker
                        id={field.name}
                        value={value as DateRange}
                        onChange={onChange}
                      />
                    )}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
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
                    id={field.name}
                    type={field.type as string}
                    placeholder={field.placeholder}
                    {...register(field.name)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <Button 
            variant="secondary" 
            onClick={handleReset}
            className="flex-1"
          >
            Limpar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            Aplicar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
