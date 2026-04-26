import { vi, describe } from 'vitest';
import { runMutationRegistryTests } from '@/test/mutation-tester';
import { roleMutations } from '../role.mutations';
import { roleService } from '../../services/role.service';

vi.mock('../../services/role.service', () => ({
  roleService: {
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

describe('roleMutations', () => {
  runMutationRegistryTests({
    registry: roleMutations,
    service: roleService,
    entityName: 'role',
    queryKey: 'roles',
    createData: { name: 'Admin', permissions: ['ALL'] },
    updateData: { name: 'Super Admin' },
  });
});
