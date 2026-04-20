import type { ReactNode } from 'react';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';

interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
}

interface DataTableActionsProps {
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  deleteMessage?: string;
  extraActions?: {
    label: string;
    icon?: ReactNode;
    onClick: (id: string) => void;
    className?: string;
  }[];
}

export function DataTableActions({ 
  id, 
  onEdit, 
  onDelete, 
  deleteMessage = 'Tem certeza que deseja excluir este registro?',
  extraActions = []
}: DataTableActionsProps) {
  const actions: ActionItem[] = [
    ...(onEdit ? [{ 
      label: 'Editar', 
      icon: <Edit2 className="w-4 h-4 mr-2" />, 
      onClick: () => onEdit(id) 
    }] : []),
    ...(onDelete ? [{ 
      label: 'Excluir', 
      icon: <Trash2 className="w-4 h-4 mr-2 text-red-600" />, 
      onClick: () => {
        if (confirm(deleteMessage)) onDelete(id);
      },
      className: 'text-red-600 focus:text-red-600 focus:bg-red-50'
    }] : []),
    ...extraActions.map(a => ({ 
      label: a.label,
      icon: a.icon,
      onClick: () => a.onClick(id),
      className: a.className
    }))
  ];

  if (actions.length === 0) return null;

  // Se houver apenas uma ação, renderiza apenas o botão direto
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={action.onClick} 
          className={action.className}
          title={action.label}
        >
          {action.icon}
        </Button>
      </div>
    );
  }

  // Se houver múltiplas ações, renderiza um dropdown
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, idx) => (
            <DropdownMenuItem 
              key={idx} 
              onClick={action.onClick}
              className={action.className}
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
