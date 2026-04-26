import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { ROLE_FILTER_CONFIG } from '../constants/role.constants';

interface RoleFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

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
