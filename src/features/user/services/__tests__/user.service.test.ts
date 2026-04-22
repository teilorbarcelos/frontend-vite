import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../user.service';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUsers calls correct endpoint with params', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { items: [], total: 0 } });
    
    await userService.getUsers({ page: 1, size: 10, searchWord: 'test', searchFields: ['name'], sort: { orderBy: 'name', orderDirection: 'asc' } });
    
    expect(api.get).toHaveBeenCalledWith('/v1/user', expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        size: 10,
        searchWord: 'test',
        searchFields: 'name',
        orderBy: 'name',
        orderDirection: 'asc'
      })
    }));
  });

  it('getUsers calls correct endpoint with minimal options', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { items: [], total: 0 } });
    await userService.getUsers({});
    expect(api.get).toHaveBeenCalledWith('/v1/user', {
      params: expect.objectContaining({
        page: 0,
        size: 25
      })
    });
  });

  it('getUsers calls /all if all option is true', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await userService.getUsers({ all: true });
    expect(api.get).toHaveBeenCalledWith('/v1/user/all', expect.anything());
  });

  it('getUser calls correct endpoint', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await userService.getUser('1');
    expect(api.get).toHaveBeenCalledWith('/v1/user/1');
  });

  it('createUser calls correct endpoint', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: {} });
    await userService.createUser({ name: 'John', email: 'a@b.com', id_role: 'r1' });
    expect(api.post).toHaveBeenCalledWith('/v1/user', { name: 'John', email: 'a@b.com', id_role: 'r1' });
  });

  it('updateUser calls correct endpoint', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: {} });
    await userService.updateUser('1', { name: 'John' });
    expect(api.put).toHaveBeenCalledWith('/v1/user/1', { name: 'John' });
  });

  it('deleteUser calls correct endpoint', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await userService.deleteUser('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/user/1');
  });

  it('toggleStatus calls correct endpoint', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await userService.toggleStatus('1', false);
    expect(api.patch).toHaveBeenCalledWith('/v1/user/1/status', { active: false });
  });
});
