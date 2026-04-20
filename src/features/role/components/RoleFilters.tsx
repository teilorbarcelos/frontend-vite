
import { FilterDrawer, type FilterField } from '@/components/ui/FilterDrawer';

interface RoleFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

const ROLE_FILTER_CONFIG: FilterField[] = [
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

export function RoleFilters({ 
  isOpen, 
  onClose, 
  onFilter, 
  initialValues 
}: RoleFiltersProps) {
  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      fields={ROLE_FILTER_CONFIG}
      onFilter={onFilter}
      initialValues={initialValues}
    />
  );
}
