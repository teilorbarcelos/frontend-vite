import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { PRODUCT_FILTER_CONFIG } from '../constants/product.constants';

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

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
