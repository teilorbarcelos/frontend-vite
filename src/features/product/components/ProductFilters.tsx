import React from 'react';
import { FilterDrawer, type FilterField } from '@/components/ui/FilterDrawer';

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

const PRODUCT_FILTER_CONFIG: FilterField[] = [
  { 
    name: 'active', 
    label: 'Status', 
    type: 'select', 
    options: [
      { label: 'Ativo', value: 'true' },
      { label: 'Inativo', value: 'false' }
    ] 
  },
  { name: 'createdAt', label: 'Data de Criação', type: 'dateRange' }
];

export function ProductFilters({ 
  isOpen, 
  onClose, 
  onFilter, 
  initialValues 
}: ProductFiltersProps) {
  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      fields={PRODUCT_FILTER_CONFIG}
      onFilter={onFilter}
      initialValues={initialValues}
    />
  );
}
