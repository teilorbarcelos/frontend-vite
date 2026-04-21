import * as React from 'react';
import type { ReactNode } from 'react';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../Modal';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete?.(id);
  };

  const actions: ActionItem[] = [
    ...(onEdit ? [{ 
      label: 'Editar', 
      icon: <Edit2 className="w-4 h-4 mr-2" />, 
      onClick: () => onEdit(id) 
    }] : []),
    ...(onDelete ? [{ 
      label: 'Excluir', 
      icon: <Trash2 className="w-4 h-4 mr-2 text-red-600" />, 
      onClick: () => setIsDeleteDialogOpen(true),
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

  return (
    <div className="flex justify-end">
      {/* Botão simples ou Dropdown */}
      {actions.length === 1 ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={actions[0].onClick} 
          className={actions[0].className}
          title={actions[0].label}
        >
          {actions[0].icon}
        </Button>
      ) : (
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
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Confirmar Exclusão</ModalTitle>
            <ModalDescription className="py-2">
              {deleteMessage}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
