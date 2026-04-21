import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../product.service';
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

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts calls correct endpoint with all options', async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    await productService.getProducts({
      all: true,
      searchWord: 'test',
      searchFields: ['name'],
      sort: { orderBy: 'price', orderDirection: 'desc' },
      filters: { category: 'C1' }
    });
    expect(api.get).toHaveBeenCalledWith('/v1/product/all', {
      params: expect.objectContaining({
        searchWord: 'test',
        searchFields: 'name',
        orderBy: 'price',
        orderDirection: 'desc',
        category: 'C1'
      })
    });
  });

  it('getProduct calls correct endpoint', async () => {
    (api.get as any).mockResolvedValue({ data: {} });
    await productService.getProduct('1');
    expect(api.get).toHaveBeenCalledWith('/v1/product/1');
  });

  it('createProduct calls correct endpoint', async () => {
    (api.post as any).mockResolvedValue({ data: {} });
    await productService.createProduct({ name: 'P1', price: 10 });
    expect(api.post).toHaveBeenCalledWith('/v1/product', { name: 'P1', price: 10 });
  });

  it('updateProduct calls correct endpoint', async () => {
    (api.put as any).mockResolvedValue({ data: {} });
    await productService.updateProduct('1', { name: 'P1' });
    expect(api.put).toHaveBeenCalledWith('/v1/product/1', { name: 'P1' });
  });

  it('deleteProduct calls correct endpoint', async () => {
    (api.delete as any).mockResolvedValue({ data: {} });
    await productService.deleteProduct('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/product/1');
  });

  it('toggleStatus calls correct endpoint', async () => {
    (api.patch as any).mockResolvedValue({ data: {} });
    await productService.toggleStatus('1', true);
    expect(api.patch).toHaveBeenCalledWith('/v1/product/1/status', { active: true });
  });
});
