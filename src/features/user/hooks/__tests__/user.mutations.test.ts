import { vi, describe } from 'vitest';
import { runMutationRegistryTests } from '@/test/mutation-tester';
import { userMutations } from '../user.mutations';
import { userService } from '../../services/user.service';

vi.mock('../../services/user.service', () => ({
  userService: {
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('userMutations', () => {
  runMutationRegistryTests({
    registry: userMutations,
    service: userService,
    entityName: 'user',
    queryKey: 'users',
    createData: { name: 'John Doe', email: 'john@example.com', id_role: '1' },
    updateData: { name: 'John Updated' },
  });
});
