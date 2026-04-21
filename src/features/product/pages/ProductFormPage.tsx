import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { productService } from '../services/product.service';
import { useLoading } from '@/hooks/useLoading';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Invalid price'),
  stock: z.number().int().min(0, 'Invalid stock'),
  description: z.string().min(1, 'Description is required'),
});

type ProductForm = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== 'new');
  const { success, error: toastError } = useToast();

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id as string),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    values: product ? {
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
    } : undefined,
  });

  const { showLoading, hideLoading } = useLoading();

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => {
      showLoading('Salvando produto...');
      if (isEditing) {
        return productService.updateProduct(id as string, data);
      }
      return productService.createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      hideLoading();
      success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      navigate('/products');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      hideLoading();
      toastError(err.response?.data?.message || 'Erro ao salvar produto. Tente novamente.');
    }
  });

  const onSubmit = (data: ProductForm) => {
    mutation.mutate(data);
  };

  if (isEditing && isLoadingProduct) {
    return <div className="p-8 text-center text-gray-500">Loading product data...</div>;
  }

  return (
    <div className="overflow-y-auto flex-1 pb-8">
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/products')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Product Name"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU"
            {...register('sku')}
            error={errors.sku?.message}
            placeholder="SKU-123"
          />

          <Input
            label="Category"
            {...register('category')}
            error={errors.category?.message}
            placeholder="Category"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="0.00"
          />

          <Input
            label="Stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            error={errors.stock?.message}
            placeholder="0"
          />
        </div>

        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Product description"
        />

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}
