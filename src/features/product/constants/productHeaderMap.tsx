import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Product } from '../services/product.service';

export const getProductColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  }
): HeaderMapItem<Product>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
  { title: 'SKU', keyItem: 'sku', truncate: true, sortable: true },
  { title: 'Categoria', keyItem: 'category', truncate: true, sortable: true },
  {
    title: 'Preço',
    keyItem: 'price',
    sortable: true,
    parseItem: (price) => `$${price != null ? Number(price).toFixed(2) : '0.00'}`,
  },
  { title: 'Estoque', keyItem: 'stock', sortable: true },
  {
    title: 'Status',
    keyItem: 'active',
    sortable: true,
    parseItem: (active, product) => (
      <StatusBadge 
        active={!!active} 
        feature="product" 
        onClick={() => onToggleStatus(product.id, !product.active)} 
      />
    ),
  },
  {
    title: '',
    keyItem: 'id',
    parseItem: (id) => (
      <DataTableActions 
        id={id as string} 
        onEdit={permissions.canUpdate ? onEdit : undefined} 
        onDelete={permissions.canDelete ? onDelete : undefined}
        deleteMessage="Tem certeza que deseja excluir este produto?"
      />
    ),
  },
];
