import { createMutationRegistry } from '@/hooks/MutationRegistry';
import { userService, type User } from '../services/user.service';

export const userMutations = createMutationRegistry<User>({
  queryKey: 'users',
  service: userService,
  name: 'user',
  messages: {
    saveSuccess: (isEditing) => isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!',
    saveError: 'Erro ao salvar usuário. Tente novamente.',
    deleteSuccess: 'Usuário excluído com sucesso!',
    deleteError: 'Erro ao excluir usuário.',
    toggleStatusSuccess: 'Status do usuário atualizado!',
    toggleStatusError: 'Erro ao atualizar status.',
    loadingLabel: 'Salvando usuário...'
  }
});
