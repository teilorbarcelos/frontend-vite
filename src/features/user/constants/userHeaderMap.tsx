import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { User } from '../services/user.service';

export const getUserColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  }
): HeaderMapItem<User>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
  { title: 'Email', keyItem: 'email', truncate: true, sortable: true },
  {
    title: 'Status',
    keyItem: 'active',
    sortable: true,
    parseItem: (active, user) => (
      <StatusBadge 
        active={!!active} 
        feature="user" 
        onClick={() => onToggleStatus(user.id, !user.active)} 
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
        deleteMessage="Tem certeza que deseja excluir este usuário?"
      />
    ),
  },
];
