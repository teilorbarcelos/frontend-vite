import type { FilterField } from '@/components/ui/FilterDrawer';

export const USER_SEARCHABLE_FIELDS = ['name', 'email', 'Role.name'];

export const USER_FILTER_CONFIG: FilterField[] = [
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
