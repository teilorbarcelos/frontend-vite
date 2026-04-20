import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import type { Role } from '../services/role.service';

export const getRoleColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): HeaderMapItem<Role>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true },
  { title: 'Descrição', keyItem: 'description', truncate: true },
  {
    title: 'Status',
    keyItem: 'active',
    parseItem: (active, role) => (
      <button
        onClick={() => onToggleStatus(role.id, !role.active)}
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
        deleteMessage="Tem certeza que deseja excluir esta função?"
      />
    ),
  },
];
