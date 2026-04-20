import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import type { Product } from '../services/product.service';

export const getProductColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): HeaderMapItem<Product>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true },
  { title: 'SKU', keyItem: 'sku', truncate: true },
  { title: 'Categoria', keyItem: 'category', truncate: true },
  {
    title: 'Preço',
    keyItem: 'price',
    parseItem: (price) => `$${price != null ? Number(price).toFixed(2) : '0.00'}`,
  },
  { title: 'Estoque', keyItem: 'stock' },
  {
    title: 'Status',
    keyItem: 'active',
    parseItem: (active, product) => (
      <button
        onClick={() => onToggleStatus(product.id, !product.active)}
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
          active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {active ? 'Ativo' : 'Inativo'}
      </button>
    ),
  },
  {
    title: '',
    keyItem: 'id',
    parseItem: (id) => (
      <DataTableActions 
        id={id as string} 
        onEdit={onEdit} 
        onDelete={onDelete}
        deleteMessage="Tem certeza que deseja excluir este produto?"
      />
    ),
  },
];
