import type { FilterField } from '@/components/ui/FilterDrawer';

export const ROLE_SEARCHABLE_FIELDS = ['name'];

export const ROLE_FILTER_CONFIG: FilterField[] = [
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
