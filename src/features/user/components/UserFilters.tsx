import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { USER_FILTER_CONFIG } from '../constants/user.constants';

interface UserFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

export function UserFilters({ 
  isOpen, 
  onClose, 
  onFilter, 
  initialValues 
}: UserFiltersProps) {
  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      fields={USER_FILTER_CONFIG}
      onFilter={onFilter}
      initialValues={initialValues}
    />
  );
}
