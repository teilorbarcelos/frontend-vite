import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import type { User } from '../services/user.service';

export const getUserColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): HeaderMapItem<User>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
  { title: 'Email', keyItem: 'email', truncate: true, sortable: true },
  {
    title: 'Status',
    keyItem: 'active',
    sortable: true,
    parseItem: (active, user) => (
      <button
        onClick={() => onToggleStatus(user.id, !user.active)}
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
        deleteMessage="Tem certeza que deseja excluir este usuário?"
      />
    ),
  },
];
