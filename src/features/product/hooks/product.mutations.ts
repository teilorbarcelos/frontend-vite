import { createMutationRegistry } from '@/hooks/MutationRegistry';
import { productService, type Product } from '../services/product.service';

export const productMutations = createMutationRegistry<Product>({
  queryKey: 'products',
  service: productService,
  name: 'product',
  messages: {
    saveSuccess: (isEditing) => isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
    saveError: 'Erro ao salvar produto. Tente novamente.',
    deleteSuccess: 'Produto excluído com sucesso!',
    deleteError: 'Erro ao excluir produto.',
    toggleStatusSuccess: 'Status do produto atualizado!',
    toggleStatusError: 'Erro ao atualizar status.',
    loadingLabel: 'Salvando produto...'
  }
});
