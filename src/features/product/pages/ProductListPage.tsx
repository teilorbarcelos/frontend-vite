import { DataTable } from '@/components/ui/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { useDataTable } from '@/hooks/useDataTable';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageHeader } from '@/components/ui/ListPageHeader';
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
  const { hasPermission } = useAuth();

  const permissions = useMemo(() => ({
    canCreate: hasPermission('product', 'create'),
    canUpdate: hasPermission('product', 'create'),
    canDelete: hasPermission('product', 'delete'),
  }), [hasPermission]);

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
    (id) => deleteMutation.mutate(id),
    permissions
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar produtos</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ListPageHeader
        title="Produtos"
        onSearch={handleSearch}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={Object.keys(filters).length}
        onCreateClick={permissions.canCreate ? () => navigate('/products/new') : undefined}
        createLabel="Novo Produto"
      />

      <ProductFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={handleFilter}
        initialValues={filters}
      />

      <DataTable
        {...dataTableProps}
        data={data?.items || []}
        headerMap={columns}
        isLoading={isFetching}
        totalItems={data?.total || 0}
      />
    </div>
  );
}
