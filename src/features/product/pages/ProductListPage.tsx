import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { productService } from '../services/product.service';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

export function ProductListPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', page, size],
    queryFn: () => productService.getProducts(page, size),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => productService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading products...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading products</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => navigate('/products/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.map((product: any) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
              <TableCell className="text-gray-500">{product.sku}</TableCell>
              <TableCell className="text-gray-500">{product.category}</TableCell>
              <TableCell className="text-gray-500">
                ${product.price != null ? Number(product.price).toFixed(2) : '0.00'}
              </TableCell>
              <TableCell className="text-gray-500">{product.stock}</TableCell>
              <TableCell>
                <button
                  onClick={() => toggleStatusMutation.mutate({ id: product.id, active: !product.active })}
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                    product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.active ? 'Active' : 'Inactive'}
                </button>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${product.id}`)}>
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (confirm('Are you sure you want to delete this product?')) {
                    deleteMutation.mutate(product.id);
                  }
                }}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!data?.items?.length && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {data?.total > 0 && (
        <Pagination
          page={page}
          total={data.total}
          size={size}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
    </div>
  );
}
