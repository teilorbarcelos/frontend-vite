import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDataTable } from '@/hooks/useDataTable';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Filter, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFilters } from '../components/ProductFilters';
import { PRODUCT_SEARCHABLE_FIELDS as searchFields } from '../constants/product.constants';
import { getProductColumns } from '../constants/productHeaderMap';
import { productService } from '../services/product.service';

export function ProductListPage() {
  const {
    page,
    size,
    searchWord,
    filters,
    sort,
    handleSearch,
    handleFilter,
    tableProps: dataTableProps
  } = useDataTable();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isError, isFetching } = useQuery({
    queryKey: ['products', page, size, searchWord, filters, sort],
    queryFn: () => productService.getProducts({
      page, 
      size, 
      searchWord, 
      searchFields, 
      filters,
      sort,
      all: true
    }),
    placeholderData: (prev) => prev,
  });

  const { success, error: toastError } = useToast();

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => productService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Status do produto atualizado!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao atualizar status.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Produto excluído com sucesso!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao excluir produto.');
    }
  });

  const columns = getProductColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/products/update/${id}`),
    (id) => deleteMutation.mutate(id)
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar produtos</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <div className="flex items-center space-x-4">
          <SearchInput 
            onSearch={handleSearch} 
            className="w-80"
          />
          <Button 
            variant="secondary" 
            onClick={() => setIsFilterOpen(true)}
            className={Object.keys(filters).length > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <ProductFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={handleFilter}
        initialValues={filters}
      />

      <DataTable
        data={data?.items || []}
        headerMap={columns}
        isLoading={isFetching}
        {...dataTableProps}
        paginationProps={{
          ...dataTableProps.paginationProps,
          totalPages: data?.total ? Math.ceil(data.total / size) : 0,
          totalItems: data?.total,
        }}
      />
    </div>
  );
}
