import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleService } from '../role.service';
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

describe('roleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRoles calls correct endpoint with all options', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { items: [], total: 0 } });
    await roleService.getRoles({
      all: true,
      searchWord: 'test',
      searchFields: ['name'],
      sort: { orderBy: 'name', orderDirection: 'asc' },
      filters: { active: true }
    });
    expect(api.get).toHaveBeenCalledWith('/v1/role/all', {
      params: expect.objectContaining({
        searchWord: 'test',
        searchFields: 'name',
        orderBy: 'name',
        orderDirection: 'asc',
        active: true
      })
    });
  });

  it('getRoles calls correct endpoint with minimal options', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { items: [], total: 0 } });
    await roleService.getRoles({});
    expect(api.get).toHaveBeenCalledWith('/v1/role', {
      params: {
        page: 0,
        size: 25
      }
    });
  });

  it('getRole calls correct endpoint', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await roleService.getRole('1');
    expect(api.get).toHaveBeenCalledWith('/v1/role/1');
  });

  it('getFeatures calls correct endpoint', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await roleService.getFeatures();
    expect(api.get).toHaveBeenCalledWith('/v1/role/features');
  });

  it('createRole calls correct endpoint', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: {} });
    await roleService.createRole({ name: 'R1', description: 'D1', permissions: [] });
    expect(api.post).toHaveBeenCalledWith('/v1/role', { name: 'R1', description: 'D1', permissions: [] });
  });

  it('updateRole calls correct endpoint', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: {} });
    await roleService.updateRole('1', { name: 'R1', description: 'D1', permissions: [] });
    expect(api.put).toHaveBeenCalledWith('/v1/role/1', { name: 'R1', description: 'D1', permissions: [] });
  });

  it('deleteRole calls correct endpoint', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await roleService.deleteRole('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/role/1');
  });

  it('toggleStatus calls correct endpoint', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await roleService.toggleStatus('1', true);
    expect(api.patch).toHaveBeenCalledWith('/v1/role/1/status', { active: true });
  });

  it('mageSelect calls getRoles', async () => {
    const spy = vi.spyOn(roleService, 'getRoles').mockResolvedValue({ items: [], total: 0 });
    await roleService.mageSelect(0, 'query', { searchFields: ['name'] });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      page: 0,
      size: 10,
      searchWord: 'query',
      searchFields: ['name']
    }));
  });

  it('mageHydrate returns empty array for empty ids', async () => {
    const results = await roleService.mageHydrate([]);
    expect(results).toEqual([]);
  });

  it('mageHydrate calls getRole for each id', async () => {
    const spy = vi.spyOn(roleService, 'getRole').mockResolvedValue({ id: '1', name: 'R1' });
    const results = await roleService.mageHydrate(['1', '2']);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });

  it('mageHydrate handles getRole errors', async () => {
    vi.spyOn(roleService, 'getRole').mockRejectedValueOnce(new Error('Failed')).mockResolvedValueOnce({ id: '2', name: 'R2' });
    const results = await roleService.mageHydrate(['1', '2']);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });
});
