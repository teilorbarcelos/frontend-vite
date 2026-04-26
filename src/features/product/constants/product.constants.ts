import type { FilterField } from '@/components/ui/FilterDrawer';

export const PRODUCT_SEARCHABLE_FIELDS = ['name', 'sku', 'category'];

export const PRODUCT_FILTER_CONFIG: FilterField[] = [
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
