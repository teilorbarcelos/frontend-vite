import { createMutationRegistry } from '@/hooks/MutationRegistry';
import { roleService, type Role } from '../services/role.service';

export const roleMutations = createMutationRegistry<Role>({
  queryKey: 'roles',
  service: roleService,
  name: 'role',
  messages: {
    saveSuccess: (isEditing) => isEditing ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!',
    saveError: 'Erro ao salvar perfil. Tente novamente.',
    deleteSuccess: 'Role excluída com sucesso!',
    deleteError: 'Erro ao excluir role.',
    toggleStatusSuccess: 'Status da role atualizado!',
    toggleStatusError: 'Erro ao atualizar status.',
    loadingLabel: 'Salvando perfil...'
  }
});
