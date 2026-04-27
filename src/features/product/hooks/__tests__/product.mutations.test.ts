import { vi, describe } from 'vitest';
import { runMutationRegistryTests } from '@/test/mutation-tester';
import { productMutations } from '../product.mutations';
import { productService } from '../../services/product.service';

vi.mock('../../services/product.service', () => ({
  productService: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('productMutations', () => {
  runMutationRegistryTests({
    registry: productMutations,
    service: productService,
    entityName: 'product',
    queryKey: 'products',
    createData: { name: 'New Product', price: 100 },
    updateData: { name: 'Updated Product' },
  });
});
